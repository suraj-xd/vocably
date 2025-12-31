import { db } from "@vocab/db";
import { dailyWord, userDailyWord, word, user } from "@vocab/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { DAILY_WORDS, TOTAL_DAILY_WORDS } from "../data/daily-words";
import { generateVocabularyData, isAIAvailable } from "./ai-service";

// Epoch date for word index calculation (Jan 1, 2025)
const EPOCH_DATE = new Date("2025-01-01T00:00:00Z");

/**
 * Get today's date in YYYY-MM-DD format (UTC)
 */
export function getTodayDateString(): string {
	const now = new Date();
	return now.toISOString().split("T")[0];
}

/**
 * Calculate which word index to use for a given date
 * Uses days since epoch, cycling through the word list
 */
export function getWordIndexForDate(dateString: string): number {
	const date = new Date(dateString + "T00:00:00Z");
	const daysSinceEpoch = Math.floor(
		(date.getTime() - EPOCH_DATE.getTime()) / (1000 * 60 * 60 * 24),
	);
	// Ensure positive index and cycle through list
	return ((daysSinceEpoch % TOTAL_DAILY_WORDS) + TOTAL_DAILY_WORDS) % TOTAL_DAILY_WORDS;
}

/**
 * Get the word for a specific date
 */
export function getWordForDate(dateString: string): string {
	const index = getWordIndexForDate(dateString);
	return DAILY_WORDS[index];
}

/**
 * Get or create today's daily word entry
 */
export async function getOrCreateTodaysDailyWord() {
	const today = getTodayDateString();
	const wordIndex = getWordIndexForDate(today);
	const term = DAILY_WORDS[wordIndex];

	// Check if already exists
	const existing = await db.query.dailyWord.findFirst({
		where: eq(dailyWord.date, today),
	});

	if (existing) {
		return existing;
	}

	// Create new daily word entry
	const [created] = await db
		.insert(dailyWord)
		.values({
			date: today,
			term,
			wordIndex,
		})
		.returning();

	return created;
}

/**
 * Get today's daily word with metadata
 */
export async function getTodaysDailyWord() {
	return getOrCreateTodaysDailyWord();
}

/**
 * Check if a user already has a word in their vocabulary
 */
async function userHasWord(userId: string, term: string): Promise<boolean> {
	const existing = await db.query.word.findFirst({
		where: and(
			eq(word.userId, userId),
			eq(word.term, term.toLowerCase().trim()),
		),
	});
	return !!existing;
}

/**
 * Add the daily word to a single user's vocabulary
 * Returns the created word or null if skipped
 */
export async function addDailyWordToUser(
	userId: string,
	dailyWordEntry: typeof dailyWord.$inferSelect,
): Promise<{ word: typeof word.$inferSelect | null; skipped: boolean }> {
	const term = dailyWordEntry.term.toLowerCase().trim();

	// Check if user already has this word
	if (await userHasWord(userId, term)) {
		// Record that we skipped this user
		await db
			.insert(userDailyWord)
			.values({
				userId,
				dailyWordId: dailyWordEntry.id,
				wordId: null,
				skipped: true,
			})
			.onConflictDoNothing();

		return { word: null, skipped: true };
	}

	// Generate AI data if available
	let aiData: {
		meaning?: string;
		partOfSpeech?: string;
		pronunciation?: string;
		memorableExplanation?: string;
		hindiTranslation?: string;
		hindiContext?: string;
		usageExamples?: string[];
		synonyms?: string[];
		antonyms?: string[];
		difficulty?: string;
		categoryName?: string;
		aiGenerated?: boolean;
		aiProvider?: string;
	} = {};

	if (await isAIAvailable(userId)) {
		const result = await generateVocabularyData(term, userId);
		if (result) {
			aiData = {
				meaning: result.data.meaning,
				partOfSpeech: result.data.partOfSpeech,
				pronunciation: result.data.pronunciation,
				memorableExplanation: result.data.memorableExplanation,
				hindiTranslation: result.data.hindiTranslation,
				hindiContext: result.data.hindiContext,
				usageExamples: result.data.usageExamples,
				synonyms: result.data.synonyms,
				antonyms: result.data.antonyms,
				difficulty: result.data.difficulty,
				categoryName: result.data.category,
				aiGenerated: true,
				aiProvider: result.provider,
			};
		}
	}

	// Find or create category if AI generated one
	let categoryId: string | undefined;
	if (aiData.categoryName) {
		const { category } = await import("@vocab/db/schema");
		const existingCategory = await db.query.category.findFirst({
			where: and(
				eq(category.userId, userId),
				eq(category.name, aiData.categoryName.toLowerCase()),
			),
		});

		if (existingCategory) {
			categoryId = existingCategory.id;
		} else {
			const [newCategory] = await db
				.insert(category)
				.values({
					userId,
					name: aiData.categoryName.toLowerCase(),
				})
				.returning();
			categoryId = newCategory.id;
		}
	}

	// Insert the word
	const [newWord] = await db
		.insert(word)
		.values({
			userId,
			term,
			categoryId,
			meaning: aiData.meaning,
			partOfSpeech: aiData.partOfSpeech,
			pronunciation: aiData.pronunciation,
			memorableExplanation: aiData.memorableExplanation,
			hindiTranslation: aiData.hindiTranslation,
			hindiContext: aiData.hindiContext,
			usageExamples: aiData.usageExamples,
			synonyms: aiData.synonyms,
			antonyms: aiData.antonyms,
			difficulty: aiData.difficulty,
			aiGenerated: aiData.aiGenerated ?? false,
			aiProvider: aiData.aiProvider,
			source: "word_of_day",
		})
		.returning();

	// Record that we added this word for the user
	await db
		.insert(userDailyWord)
		.values({
			userId,
			dailyWordId: dailyWordEntry.id,
			wordId: newWord.id,
			skipped: false,
		})
		.onConflictDoNothing();

	return { word: newWord, skipped: false };
}

/**
 * Process daily word for all active users
 * This is called by the cron job
 */
export async function processDailyWordForAllUsers(): Promise<{
	dailyWord: typeof dailyWord.$inferSelect;
	processed: number;
	added: number;
	skipped: number;
	errors: number;
}> {
	// Get or create today's daily word
	const todaysDailyWord = await getOrCreateTodaysDailyWord();

	// Get all users
	const allUsers = await db.query.user.findMany({
		columns: { id: true },
	});

	let processed = 0;
	let added = 0;
	let skipped = 0;
	let errors = 0;

	// Process each user
	for (const userData of allUsers) {
		try {
			// Check if we already processed this user for today
			const alreadyProcessed = await db.query.userDailyWord.findFirst({
				where: and(
					eq(userDailyWord.userId, userData.id),
					eq(userDailyWord.dailyWordId, todaysDailyWord.id),
				),
			});

			if (alreadyProcessed) {
				continue; // Skip already processed users
			}

			const result = await addDailyWordToUser(userData.id, todaysDailyWord);
			processed++;

			if (result.skipped) {
				skipped++;
			} else {
				added++;
			}
		} catch (error) {
			console.error(`Error processing daily word for user ${userData.id}:`, error);
			errors++;
		}
	}

	return {
		dailyWord: todaysDailyWord,
		processed,
		added,
		skipped,
		errors,
	};
}

/**
 * Get a user's daily word status for today
 */
export async function getUserDailyWordStatus(userId: string) {
	const todaysDailyWord = await getTodaysDailyWord();

	const userStatus = await db.query.userDailyWord.findFirst({
		where: and(
			eq(userDailyWord.userId, userId),
			eq(userDailyWord.dailyWordId, todaysDailyWord.id),
		),
		with: {
			word: true,
		},
	});

	return {
		dailyWord: todaysDailyWord,
		userStatus,
		hasReceived: !!userStatus,
		wasSkipped: userStatus?.skipped ?? false,
	};
}
