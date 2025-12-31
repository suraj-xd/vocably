import type { Context as ElysiaContext } from "elysia";
import { createHash } from "crypto";

import { auth } from "@vocably/auth";
import { db } from "@vocably/db";
import { apiToken } from "@vocably/db/schema";
import { eq, and } from "drizzle-orm";

export type CreateContextOptions = {
	context: ElysiaContext;
};

export type AuthType = "session" | "token" | null;

async function validateApiToken(token: string) {
	if (!token.startsWith("vocably_")) {
		return null;
	}

	const tokenHash = createHash("sha256").update(token).digest("hex");

	const [tokenRecord] = await db
		.select()
		.from(apiToken)
		.where(and(eq(apiToken.tokenHash, tokenHash), eq(apiToken.isActive, true)))
		.limit(1);

	if (!tokenRecord) {
		return null;
	}

	// Check expiration
	if (tokenRecord.expiresAt && tokenRecord.expiresAt < new Date()) {
		return null;
	}

	// Update last used
	await db
		.update(apiToken)
		.set({ lastUsedAt: new Date() })
		.where(eq(apiToken.id, tokenRecord.id));

	return {
		userId: tokenRecord.userId,
		tokenId: tokenRecord.id,
		permissions: tokenRecord.permissions,
	};
}

export async function createContext({ context }: CreateContextOptions) {
	// Try session auth first (web app)
	const session = await auth.api.getSession({
		headers: context.request.headers,
	});

	if (session?.user) {
		return {
			session,
			authType: "session" as AuthType,
			apiToken: null,
		};
	}

	// Try API token auth (CLI/MCP)
	const authHeader = context.request.headers.get("Authorization");
	if (authHeader?.startsWith("Bearer vocably_")) {
		const token = authHeader.slice(7); // Remove "Bearer "
		const tokenData = await validateApiToken(token);

		if (tokenData) {
			return {
				session: {
					user: { id: tokenData.userId },
					session: null,
				},
				authType: "token" as AuthType,
				apiToken: tokenData,
			};
		}
	}

	return {
		session: null,
		authType: null as AuthType,
		apiToken: null,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
