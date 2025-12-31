import { z } from "zod";
import { randomBytes, createHash } from "crypto";
import { ORPCError } from "@orpc/server";
import { protectedProcedure } from "../index";
import { db } from "@vocab/db";
import { apiToken } from "@vocab/db/schema";
import { eq, and } from "drizzle-orm";

// Generate a secure API token
function generateToken(): string {
	const randomPart = randomBytes(24).toString("base64url");
	return `vocab_${randomPart}`;
}

// Hash token for storage
function hashToken(token: string): string {
	return createHash("sha256").update(token).digest("hex");
}

// Input schemas
const createTokenInput = z.object({
	name: z.string().min(1).max(100),
	permissions: z
		.array(z.enum(["read", "write", "delete"]))
		.default(["read", "write"]),
	expiresInDays: z.number().optional(),
});

const revokeTokenInput = z.object({
	id: z.string().uuid(),
});

const deleteTokenInput = z.object({
	id: z.string().uuid(),
});

export const apiTokensRouter = {
	// List user's API tokens (never return full token)
	list: protectedProcedure.handler(async ({ context }) => {
		const userId = context.session?.user?.id;
		if (!userId) throw new ORPCError("UNAUTHORIZED", { message: "User not found" });

		const tokens = await db
			.select({
				id: apiToken.id,
				name: apiToken.name,
				tokenPrefix: apiToken.tokenPrefix,
				permissions: apiToken.permissions,
				lastUsedAt: apiToken.lastUsedAt,
				isActive: apiToken.isActive,
				expiresAt: apiToken.expiresAt,
				createdAt: apiToken.createdAt,
			})
			.from(apiToken)
			.where(eq(apiToken.userId, userId));

		return { tokens };
	}),

	// Create new API token
	create: protectedProcedure.input(createTokenInput).handler(async ({ context, input }) => {
		const userId = context.session?.user?.id;
		if (!userId) throw new ORPCError("UNAUTHORIZED", { message: "User not found" });

		const plainToken = generateToken();
		const tokenHash = hashToken(plainToken);
		const tokenPrefix = plainToken.slice(0, 12);

		const [token] = await db
			.insert(apiToken)
			.values({
				userId,
				name: input.name,
				tokenHash,
				tokenPrefix,
				permissions: input.permissions,
				expiresAt: input.expiresInDays
					? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000)
					: null,
			})
			.returning();

		// Return plain token ONLY on creation (user must save it)
		return {
			id: token.id,
			name: token.name,
			token: plainToken, // Only time we return the full token!
			prefix: tokenPrefix,
			permissions: token.permissions,
			expiresAt: token.expiresAt,
		};
	}),

	// Revoke token (soft delete)
	revoke: protectedProcedure.input(revokeTokenInput).handler(async ({ context, input }) => {
		const userId = context.session?.user?.id;
		if (!userId) throw new ORPCError("UNAUTHORIZED", { message: "User not found" });

		await db
			.update(apiToken)
			.set({ isActive: false })
			.where(and(eq(apiToken.id, input.id), eq(apiToken.userId, userId)));

		return { success: true };
	}),

	// Delete token permanently
	delete: protectedProcedure.input(deleteTokenInput).handler(async ({ context, input }) => {
		const userId = context.session?.user?.id;
		if (!userId) throw new ORPCError("UNAUTHORIZED", { message: "User not found" });

		await db
			.delete(apiToken)
			.where(and(eq(apiToken.id, input.id), eq(apiToken.userId, userId)));

		return { success: true };
	}),
};
