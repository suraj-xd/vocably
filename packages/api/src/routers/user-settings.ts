import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { protectedProcedure } from "../index";
import { db } from "@vocably/db";
import { userSettings } from "@vocably/db/schema";
import { eq } from "drizzle-orm";

const updateSettingsInput = z.object({
	aiProvider: z.enum(["openai", "anthropic", "google"]).optional(),
	aiApiKey: z.string().optional(),
	aiModel: z.string().optional(),
	theme: z.enum(["light", "dark", "system"]).optional(),
	nativeLanguage: z.string().min(2).max(5).optional(), // ISO 639-1 code
});

export const userSettingsRouter = {
	// Get user settings
	get: protectedProcedure.handler(async ({ context }) => {
		const userId = context.session?.user?.id;
		if (!userId) throw new ORPCError("UNAUTHORIZED", { message: "User not found" });

		let settings = await db.query.userSettings.findFirst({
			where: eq(userSettings.userId, userId),
		});

		// Create default settings if none exist
		if (!settings) {
			const [newSettings] = await db
				.insert(userSettings)
				.values({
					userId,
					aiProvider: "openai",
				})
				.returning();
			settings = newSettings;
		}

		// Don't return the actual API key, just whether one is set
		return {
			id: settings.id,
			aiProvider: settings.aiProvider,
			aiModel: settings.aiModel,
			theme: settings.theme,
			nativeLanguage: settings.defaultLanguage ?? "en",
			hasApiKey: !!settings.aiApiKey,
			// Mask the API key - show first 8 chars only
			apiKeyPreview: settings.aiApiKey
				? `${settings.aiApiKey.slice(0, 8)}...`
				: null,
		};
	}),

	// Update user settings
	update: protectedProcedure.input(updateSettingsInput).handler(async ({ context, input }) => {
		const userId = context.session?.user?.id;
		if (!userId) throw new ORPCError("UNAUTHORIZED", { message: "User not found" });

		// Check if settings exist
		const existing = await db.query.userSettings.findFirst({
			where: eq(userSettings.userId, userId),
		});

		if (existing) {
			// Update existing settings
			const [updated] = await db
				.update(userSettings)
				.set({
					aiProvider: input.aiProvider ?? existing.aiProvider,
					aiApiKey: input.aiApiKey ?? existing.aiApiKey,
					aiModel: input.aiModel ?? existing.aiModel,
					theme: input.theme ?? existing.theme,
					defaultLanguage: input.nativeLanguage ?? existing.defaultLanguage,
				})
				.where(eq(userSettings.userId, userId))
				.returning();

			return {
				success: true,
				aiProvider: updated.aiProvider,
				nativeLanguage: updated.defaultLanguage,
				hasApiKey: !!updated.aiApiKey,
			};
		} else {
			// Create new settings
			const [created] = await db
				.insert(userSettings)
				.values({
					userId,
					aiProvider: input.aiProvider ?? "openai",
					aiApiKey: input.aiApiKey,
					aiModel: input.aiModel,
					theme: input.theme ?? "system",
					defaultLanguage: input.nativeLanguage ?? "en",
				})
				.returning();

			return {
				success: true,
				aiProvider: created.aiProvider,
				nativeLanguage: created.defaultLanguage,
				hasApiKey: !!created.aiApiKey,
			};
		}
	}),

	// Clear API key
	clearApiKey: protectedProcedure.handler(async ({ context }) => {
		const userId = context.session?.user?.id;
		if (!userId) throw new ORPCError("UNAUTHORIZED", { message: "User not found" });

		await db
			.update(userSettings)
			.set({ aiApiKey: null })
			.where(eq(userSettings.userId, userId));

		return { success: true };
	}),
};
