import "dotenv/config";

const API_URL = process.env.VOCABLY_API_URL || "http://localhost:3000";
const API_TOKEN = process.env.VOCABLY_API_TOKEN || "";

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
	if (!API_TOKEN) {
		throw new ApiError(
			"VOCABLY_API_TOKEN environment variable is required",
			"NOT_CONFIGURED",
			500,
		);
	}

	const { body, ...restOptions } = options;

	let response: Response;
	try {
		response = await fetch(`${API_URL}${endpoint}`, {
			...restOptions,
			// oRPC expects body wrapped in { json: ... } format
			body: body ? JSON.stringify({ json: body }) : undefined,
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${API_TOKEN}`,
				...options.headers,
			},
		});
	} catch (error) {
		throw new ApiError(
			`Network error: Unable to connect to API at ${API_URL}`,
			"NETWORK_ERROR",
			0,
		);
	}

	if (!response.ok) {
		const errorText = await response.text();
		const errorInfo = parseErrorResponse(errorText);

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

export function formatToolResponse<T>(data: T) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
		structuredContent: data,
	};
}

export function formatErrorResponse(error: unknown) {
	const message = error instanceof Error ? error.message : String(error);
	const code = error instanceof ApiError ? error.code : "UNKNOWN_ERROR";

	return {
		content: [{ type: "text" as const, text: `Error: ${message}` }],
		structuredContent: {
			success: false,
			error: message,
			code,
		},
		isError: true,
	};
}
