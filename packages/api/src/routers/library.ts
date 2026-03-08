import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { publicProcedure, adminProcedure } from "../index";
import { db } from "@vocably/db";
import { libraryWord } from "@vocably/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import { generateVocabularyData } from "../lib/ai-service";

function slugify(term: string): string {
	return term
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

// Background AI generation for library words
async function generateLibraryAIInBackground(wordId: string, term: string, adminUserId: string) {
	try {
		await db
			.update(libraryWord)
			.set({ aiStatus: "generating" })
			.where(eq(libraryWord.id, wordId));

		const result = await generateVocabularyData(term, adminUserId);

		if (result) {
			await db
				.update(libraryWord)
				.set({
					meaning: result.data.meaning,
					partOfSpeech: result.data.partOfSpeech,
					pronunciation: result.data.pronunciation,
					memorableExplanation: result.data.memorableExplanation,
					hindiTranslation: result.data.hindiTranslation,
					hindiContext: result.data.hindiContext,
					etymology: result.data.category, // AI doesn't return etymology directly, use category
					usageExamples: result.data.usageExamples,
					synonyms: result.data.synonyms,
					antonyms: result.data.antonyms,
					difficulty: result.data.difficulty,
					category: result.data.category,
					aiGenerated: true,
					aiProvider: result.provider,
					aiStatus: "complete",
					aiError: null,
				})
				.where(eq(libraryWord.id, wordId));
		} else {
			await db
				.update(libraryWord)
				.set({ aiStatus: "error", aiError: "AI generation returned no result" })
				.where(eq(libraryWord.id, wordId));
		}
	} catch (error) {
		console.error("Library AI generation failed:", error);
		await db
			.update(libraryWord)
			.set({
				aiStatus: "error",
				aiError: error instanceof Error ? error.message : "AI generation failed",
			})
			.where(eq(libraryWord.id, wordId));
	}
}

// Input schemas
const listInput = z.object({
	limit: z.number().min(1).max(100).default(50),
	offset: z.number().default(0),
});

const addInput = z.object({
	term: z.string().min(1),
	publishedAt: z.string().optional(), // ISO date string, defaults to today
	generateAI: z.boolean().default(true),
});

const updateInput = z.object({
	id: z.string().uuid(),
	meaning: z.string().optional(),
	partOfSpeech: z.string().optional(),
	pronunciation: z.string().optional(),
	memorableExplanation: z.string().optional(),
	hindiTranslation: z.string().optional(),
	hindiContext: z.string().optional(),
	etymology: z.string().optional(),
	difficulty: z.string().optional(),
	category: z.string().optional(),
	publishedAt: z.string().optional(),
});

const removeInput = z.object({
	id: z.string().uuid(),
});

const getBySlugInput = z.object({
	slug: z.string().min(1),
});

export const libraryRouter = {
	// Public: List all library words (paginated)
	list: publicProcedure.input(listInput).handler(async ({ input }) => {
		const [totalResult] = await db
			.select({ count: count() })
			.from(libraryWord);

		const total = totalResult?.count ?? 0;

		const words = await db
			.select()
			.from(libraryWord)
			.orderBy(desc(libraryWord.publishedAt), desc(libraryWord.createdAt))
			.limit(input.limit)
			.offset(input.offset);

		return {
			words,
			total,
			hasMore: input.offset + words.length < total,
		};
	}),

	// Public: Get today's words
	today: publicProcedure.handler(async () => {
		const today = new Date().toISOString().split("T")[0]!;

		const words = await db
			.select()
			.from(libraryWord)
			.where(eq(libraryWord.publishedAt, today))
			.orderBy(desc(libraryWord.createdAt));

		return { words, date: today };
	}),

	// Public: Get word by slug
	getBySlug: publicProcedure.input(getBySlugInput).handler(async ({ input }) => {
		const result = await db
			.select()
			.from(libraryWord)
			.where(eq(libraryWord.slug, input.slug))
			.limit(1);

		if (result.length === 0) {
			throw new ORPCError("NOT_FOUND", { message: "Word not found" });
		}

		return result[0]!;
	}),

	// Admin: Add word to library
	add: adminProcedure.input(addInput).handler(async ({ context, input }) => {
		const term = input.term.toLowerCase().trim();
		const slug = slugify(term);
		const publishedAt = input.publishedAt ?? new Date().toISOString().split("T")[0]!;
		const adminUserId = context.session.user.id;

		// Check if word already exists
		const existing = await db
			.select()
			.from(libraryWord)
			.where(eq(libraryWord.term, term))
			.limit(1);

		if (existing.length > 0) {
			throw new ORPCError("CONFLICT", { message: `Word "${term}" already exists in the library` });
		}

		const [newWord] = await db
			.insert(libraryWord)
			.values({
				term,
				slug,
				publishedAt,
				aiStatus: input.generateAI ? "pending" : "idle",
			})
			.returning();

		if (input.generateAI && newWord) {
			generateLibraryAIInBackground(newWord.id, term, adminUserId).catch(
				(err) => console.error("Library background AI error:", err),
			);
		}

		return { success: true, word: newWord };
	}),

	// Admin: Update library word
	update: adminProcedure.input(updateInput).handler(async ({ input }) => {
		const { id, ...updates } = input;

		const existing = await db
			.select()
			.from(libraryWord)
			.where(eq(libraryWord.id, id))
			.limit(1);

		if (existing.length === 0) {
			throw new ORPCError("NOT_FOUND", { message: "Word not found" });
		}

		const [updated] = await db
			.update(libraryWord)
			.set(updates)
			.where(eq(libraryWord.id, id))
			.returning();

		return { success: true, word: updated };
	}),

	// Admin: Remove library word
	remove: adminProcedure.input(removeInput).handler(async ({ input }) => {
		const deleted = await db
			.delete(libraryWord)
			.where(eq(libraryWord.id, input.id))
			.returning();

		if (deleted.length === 0) {
			throw new ORPCError("NOT_FOUND", { message: "Word not found" });
		}

		return { success: true };
	}),
};
