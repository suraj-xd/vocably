import { createAuthClient } from "better-auth/react";

// Use the frontend's auth proxy route instead of backend directly
// This ensures cookies are set on the frontend domain
const getBaseURL = () => {
	if (typeof window !== "undefined") {
		return window.location.origin;
	}
	// Server-side: use environment variable or default
	return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
};

export const authClient = createAuthClient({
	baseURL: getBaseURL(),
});
