import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { protectedProcedure, publicProcedure } from "../index";
import {
	getTodaysDailyWord,
	getUserDailyWordStatus,
	addDailyWordToUser,
	processDailyWordForAllUsers,
} from "../lib/daily-word-service";
import { env } from "@vocab/env/server";

export const dailyWordRouter = {
	// Get today's word of the day (public - no auth required)
	today: publicProcedure.handler(async () => {
		const dailyWord = await getTodaysDailyWord();
		return {
			date: dailyWord.date,
			term: dailyWord.term,
			wordIndex: dailyWord.wordIndex,
		};
	}),

	// Get user's status for today's word
	status: protectedProcedure.handler(async ({ context }) => {
		const userId = context.session?.user?.id;
		if (!userId) throw new ORPCError("UNAUTHORIZED", { message: "User not found" });

		const status = await getUserDailyWordStatus(userId);

		return {
			date: status.dailyWord.date,
			term: status.dailyWord.term,
			hasReceived: status.hasReceived,
			wasSkipped: status.wasSkipped,
			word: status.userStatus?.word ?? null,
		};
	}),

	// Manually trigger adding today's word for the current user
	// Useful if user missed the cron or wants to manually add
	addToday: protectedProcedure.handler(async ({ context }) => {
		const userId = context.session?.user?.id;
		if (!userId) throw new ORPCError("UNAUTHORIZED", { message: "User not found" });

		const dailyWord = await getTodaysDailyWord();
		const result = await addDailyWordToUser(userId, dailyWord);

		return {
			success: true,
			term: dailyWord.term,
			skipped: result.skipped,
			word: result.word,
		};
	}),

	// Process daily word for all users (cron endpoint)
	// Protected by a secret key
	processAll: publicProcedure
		.input(z.object({ cronSecret: z.string() }))
		.handler(async ({ input }) => {
			// Verify the cron secret
			if (input.cronSecret !== env.CRON_SECRET) {
				throw new ORPCError("FORBIDDEN", { message: "Invalid cron secret" });
			}

			const result = await processDailyWordForAllUsers();

			return {
				success: true,
				date: result.dailyWord.date,
				term: result.dailyWord.term,
				stats: {
					processed: result.processed,
					added: result.added,
					skipped: result.skipped,
					errors: result.errors,
				},
			};
		}),
};
