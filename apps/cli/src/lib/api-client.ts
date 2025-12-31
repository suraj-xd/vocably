import { getConfig } from "./config";

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
	body?: Record<string, unknown>;
}

// oRPC error response format
interface ORPCErrorResponse {
	json: {
		defined: boolean;
		code: string;
		status: number;
		message: string;
	};
}

// Custom error class for API errors with structured info
export class ApiError extends Error {
	code: string;
	status: number;

	constructor(message: string, code: string, status: number) {
		super(message);
		this.name = "ApiError";
		this.code = code;
		this.status = status;
	}
}

// Parse oRPC error response
function parseErrorResponse(text: string): { message: string; code: string; status: number } {
	try {
		const parsed = JSON.parse(text) as ORPCErrorResponse;
		if (parsed.json && parsed.json.message) {
			return {
				message: parsed.json.message,
				code: parsed.json.code || "UNKNOWN_ERROR",
				status: parsed.json.status || 500,
			};
		}
	} catch {
		// Not JSON, return as-is
	}
	return {
		message: text || "Unknown error",
		code: "UNKNOWN_ERROR",
		status: 500,
	};
}

export async function apiRequest<T>(
	endpoint: string,
	options: ApiRequestOptions = {},
): Promise<T> {
	const config = getConfig();

	if (!config.token) {
		throw new ApiError(
			"Not authenticated. Run `vocably auth login` first.",
			"NOT_AUTHENTICATED",
			401,
		);
	}

	const { body, ...restOptions } = options;

	let response: Response;
	try {
		response = await fetch(`${config.apiUrl}${endpoint}`, {
			...restOptions,
			// oRPC expects body wrapped in { json: ... } format
			body: body ? JSON.stringify({ json: body }) : undefined,
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${config.token}`,
				...options.headers,
			},
		});
	} catch (error) {
		// Network error
		throw new ApiError(
			`Network error: Unable to connect to API at ${config.apiUrl}`,
			"NETWORK_ERROR",
			0,
		);
	}

	if (!response.ok) {
		const errorText = await response.text();
		const errorInfo = parseErrorResponse(errorText);

		// Provide user-friendly messages for common errors
		if (response.status === 401) {
			throw new ApiError(
				"Invalid or expired token. Run `vocably auth login` to re-authenticate.",
				"UNAUTHORIZED",
				401,
			);
		}

		if (response.status === 403) {
			throw new ApiError(
				errorInfo.message || "Access denied.",
				"FORBIDDEN",
				403,
			);
		}

		if (response.status === 404) {
			throw new ApiError(
				errorInfo.message || "Resource not found.",
				"NOT_FOUND",
				404,
			);
		}

		if (response.status === 409) {
			throw new ApiError(
				errorInfo.message || "Resource already exists.",
				"CONFLICT",
				409,
			);
		}

		// For other errors, use the parsed message
		throw new ApiError(
			errorInfo.message,
			errorInfo.code,
			response.status,
		);
	}

	// oRPC returns response in { json: ... } format
	const result = (await response.json()) as { json: T };
	return result.json;
}
