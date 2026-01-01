import { env } from "@vocably/env/web";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = env.NEXT_PUBLIC_SERVER_URL;

async function proxyRequest(request: NextRequest): Promise<NextResponse> {
	const url = new URL(request.url);
	// Forward to backend's /rpc endpoint
	const targetUrl = `${BACKEND_URL}${url.pathname}${url.search}`;

	// Forward the request to the backend
	const headers = new Headers(request.headers);
	headers.set("host", new URL(BACKEND_URL).host);

	const response = await fetch(targetUrl, {
		method: request.method,
		headers,
		body: request.body,
		credentials: "include",
		// @ts-expect-error - duplex is required for streaming body
		duplex: "half",
	});

	// Create response with backend's response
	const responseHeaders = new Headers(response.headers);

	// Rewrite Set-Cookie headers to use frontend domain (in case backend sets any)
	const setCookieHeaders = response.headers.getSetCookie();
	if (setCookieHeaders.length > 0) {
		responseHeaders.delete("set-cookie");
		for (const cookie of setCookieHeaders) {
			// Remove domain attribute so cookie is set on current domain
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
