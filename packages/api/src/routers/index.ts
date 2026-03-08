import type { RouterClient } from "@orpc/server";

import { protectedProcedure, publicProcedure } from "../index";
import { wordsRouter } from "./words";
import { apiTokensRouter } from "./api-tokens";
import { userSettingsRouter } from "./user-settings";
import { dailyWordRouter } from "./daily-word";
import { libraryRouter } from "./library";

export const appRouter = {
	// Health check
	healthCheck: publicProcedure.handler(() => {
		return "OK";
	}),

	// Private data (example)
	privateData: protectedProcedure.handler(({ context }) => {
		return {
			message: "This is private",
			user: context.session?.user,
			authType: context.authType,
		};
	}),

	// Words CRUD
	words: wordsRouter,

	// API Tokens management
	apiTokens: apiTokensRouter,

	// User settings
	userSettings: userSettingsRouter,

	// Daily Word of the Day
	dailyWord: dailyWordRouter,

	// Public library
	library: libraryRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
