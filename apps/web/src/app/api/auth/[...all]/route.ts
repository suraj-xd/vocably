import { env } from "@vocably/env/web";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = env.NEXT_PUBLIC_SERVER_URL;

async function proxyRequest(request: NextRequest): Promise<NextResponse> {
	const url = new URL(request.url);
	const targetUrl = `${BACKEND_URL}${url.pathname}${url.search}`;

	// Forward the request to the backend
	const headers = new Headers(request.headers);
	headers.set("host", new URL(BACKEND_URL).host);

	const response = await fetch(targetUrl, {
		method: request.method,
		headers,
		body: request.body,
		credentials: "include",
		redirect: "manual", // Don't follow redirects - pass them through
		// @ts-expect-error - duplex is required for streaming body
		duplex: "half",
	});

	// Create response with backend's response
	const responseHeaders = new Headers(response.headers);

	// Rewrite Location header for redirects to use frontend origin
	const location = response.headers.get("location");
	if (location) {
		try {
			const locationUrl = new URL(location, BACKEND_URL);
			const backendHost = new URL(BACKEND_URL).host;

			// If redirect points to backend, rewrite to frontend
			if (locationUrl.host === backendHost) {
				const frontendOrigin =
					request.headers.get("origin") ||
					request.headers.get("x-forwarded-host") ||
					new URL(request.url).origin;
				locationUrl.host = new URL(frontendOrigin).host;
				locationUrl.protocol = "https:";
				responseHeaders.set("location", locationUrl.toString());
			}
		} catch {
			// If location is relative or parsing fails, leave it as-is
		}
	}

	// Rewrite Set-Cookie headers to use frontend domain
	const setCookieHeaders = response.headers.getSetCookie();
	if (setCookieHeaders.length > 0) {
		responseHeaders.delete("set-cookie");
		for (const cookie of setCookieHeaders) {
			// Remove domain attribute so cookie is set on current domain
			// Also ensure SameSite and Secure are properly set
			let modifiedCookie = cookie
				.replace(/;\s*domain=[^;]*/gi, "")
				.replace(/;\s*samesite=[^;]*/gi, "; SameSite=Lax");

			// Ensure Secure flag for HTTPS
			if (!modifiedCookie.toLowerCase().includes("secure")) {
				modifiedCookie += "; Secure";
			}

			responseHeaders.append("set-cookie", modifiedCookie);
		}
	}

	return new NextResponse(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: responseHeaders,
	});
}

export async function GET(request: NextRequest) {
	return proxyRequest(request);
}

export async function POST(request: NextRequest) {
	return proxyRequest(request);
}
