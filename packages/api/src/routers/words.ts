import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { protectedProcedure } from "../index";
import { db } from "@vocab/db";
import { word, category, wordRelationship } from "@vocab/db/schema";
import { eq, desc, and, or, ilike } from "drizzle-orm";
import { generateVocabularyData, isAIAvailable } from "../lib/ai-service";

// Background AI generation - fire and forget
async function generateAIInBackground(
	wordId: string,
	term: string,
	userId: string,
	context?: string,
) {
	try {
		// Update status to generating
		await db
			.update(word)
			.set({ aiStatus: "generating" })
			.where(eq(word.id, wordId));

		const result = await generateVocabularyData(term, userId, context);

		if (result) {
			// Find or create category if AI generated one
			let categoryId: string | undefined;
			if (result.data.category) {
				const existingCategory = await db.query.category.findFirst({
					where: and(
						eq(category.userId, userId),
						eq(category.name, result.data.category.toLowerCase()),
					),
				});

				if (existingCategory) {
					categoryId = existingCategory.id;
				} else {
					const [newCategory] = await db
						.insert(category)
						.values({
							userId,
							name: result.data.category.toLowerCase(),
						})
						.returning();
					if (newCategory) {
						categoryId = newCategory.id;
					}
				}
			}

			// Update word with AI data
			await db
				.update(word)
				.set({
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
					categoryId,
					aiGenerated: true,
					aiProvider: result.provider,
					aiStatus: "complete",
					aiError: null,
				})
				.where(eq(word.id, wordId));
		} else {
			// AI generation returned no result
			await db
				.update(word)
				.set({
					aiStatus: "error",
					aiError: "AI generation returned no result",
				})
				.where(eq(word.id, wordId));
		}
	} catch (error) {
		console.error("Background AI generation failed:", error);
		// Update status to error
		await db
			.update(word)
			.set({
				aiStatus: "error",
				aiError: error instanceof Error ? error.message : "AI generation failed",
			})
			.where(eq(word.id, wordId));
	}
}

// Input schemas
const addWordInput = z.object({
	term: z.string().min(1),
	notes: z.string().optional(),
	context: z.string().optional(),
	generateAI: z.boolean().default(true),
	source: z.enum(["web", "cli", "mcp", "word_of_day"]).default("web"),
});

const listWordsInput = z.object({
	limit: z.number().min(1).max(100).default(50),
	offset: z.number().default(0),
	category: z.string().optional(),
});

const searchWordsInput = z.object({
	query: z.string().min(1),
	limit: z.number().min(1).max(50).default(20),
});

const getWordInput = z.object({
	id: z.string().uuid(),
});

const getWordByTermInput = z.object({
	term: z.string().min(1),
});

const removeWordInput = z.object({
	term: z.string().min(1),
});

const updateWordInput = z.object({
	id: z.string().uuid(),
	notes: z.string().optional(),
	context: z.string().optional(),
	regenerateAI: z.boolean().default(false),
});

export const wordsRouter = {
	// List all words (paginated)
	list: protectedProcedure.input(listWordsInput).handler(async ({ context, input }) => {
		const userId = context.session?.user?.id;
		if (!userId) throw new ORPCError("UNAUTHORIZED", { message: "User not found" });

		const words = await db.query.word.findMany({
			where: input.category
				? and(
						eq(word.userId, userId),
						eq(
							word.categoryId,
							db
								.select({ id: category.id })
								.from(category)
								.where(
									and(eq(category.userId, userId), eq(category.name, input.category)),
								)
								.limit(1),
						),
					)
				: eq(word.userId, userId),
			limit: input.limit,
			offset: input.offset,
			orderBy: desc(word.createdAt),
			with: {
				category: true,
			},
		});

		return { words };
	}),

	// Get single word by ID
	get: protectedProcedure.input(getWordInput).handler(async ({ context, input }) => {
		const userId = context.session?.user?.id;
		if (!userId) throw new ORPCError("UNAUTHORIZED", { message: "User not found" });

		const result = await db.query.word.findFirst({
			where: and(eq(word.id, input.id), eq(word.userId, userId)),
			with: {
				category: true,
				outgoingRelationships: {
					with: { targetWord: true },
				},
				incomingRelationships: {
					with: { sourceWord: true },
				},
			},
		});

		return result;
	}),

	// Get word by term
	getByTerm: protectedProcedure.input(getWordByTermInput).handler(async ({ context, input }) => {
		const userId = context.session?.user?.id;
		if (!userId) throw new ORPCError("UNAUTHORIZED", { message: "User not found" });

		const result = await db.query.word.findFirst({
			where: and(
				eq(word.userId, userId),
				eq(word.term, input.term.toLowerCase().trim()),
			),
			with: {
				category: true,
				outgoingRelationships: {
					with: { targetWord: true },
				},
			},
		});

		return result;
	}),

	// Add new word (optimistic - returns immediately, AI runs in background)
	add: protectedProcedure.input(addWordInput).handler(async ({ context, input }) => {
		const userId = context.session?.user?.id;
		if (!userId) throw new ORPCError("UNAUTHORIZED", { message: "User not found" });

		const term = input.term.toLowerCase().trim();

		// Check if word already exists
		const existing = await db.query.word.findFirst({
			where: and(eq(word.userId, userId), eq(word.term, term)),
		});

		if (existing) {
			throw new ORPCError("CONFLICT", { message: `Word "${term}" already exists in your vocabulary` });
		}

		// Check if AI is available and requested
		const shouldGenerateAI = input.generateAI && (await isAIAvailable(userId));

		// Insert word immediately with pending status if AI is requested
		const [newWord] = await db
			.insert(word)
			.values({
				userId,
				term,
				notes: input.notes,
				context: input.context,
				source: input.source,
				aiStatus: shouldGenerateAI ? "pending" : "idle",
			})
			.returning();

		// Fire and forget - generate AI in background
		if (shouldGenerateAI && newWord) {
			// Don't await - let it run in background
			generateAIInBackground(newWord.id, term, userId, input.context).catch(
				(err) => console.error("Background AI generation error:", err),
			);
		}

		return { success: true, word: newWord, aiPending: shouldGenerateAI };
	}),

	// Update word (optimistic - returns immediately, AI runs in background)
	update: protectedProcedure.input(updateWordInput).handler(async ({ context, input }) => {
		const userId = context.session?.user?.id;
		if (!userId) throw new ORPCError("UNAUTHORIZED", { message: "User not found" });

		// Get the existing word first
		const existingWord = await db.query.word.findFirst({
			where: and(eq(word.id, input.id), eq(word.userId, userId)),
		});

		if (!existingWord) {
			throw new ORPCError("NOT_FOUND", { message: "Word not found" });
		}

		// Check if AI regeneration is requested and available
		const shouldRegenerateAI =
			input.regenerateAI && (await isAIAvailable(userId));

		// Build update data - only include defined values
		const updateData: Record<string, unknown> = {
			updatedAt: new Date(),
		};

		// Only set notes/context if they were provided
		if (input.notes !== undefined) {
			updateData.notes = input.notes;
		}
		if (input.context !== undefined) {
			updateData.context = input.context;
		}

		// Set AI status to pending if regenerating
		if (shouldRegenerateAI) {
			updateData.aiStatus = "pending";
			updateData.aiError = null;
		}

		const [updated] = await db
			.update(word)
			.set(updateData)
			.where(and(eq(word.id, input.id), eq(word.userId, userId)))
			.returning();

		if (!updated) {
			throw new ORPCError("NOT_FOUND", { message: "Word not found" });
		}

		// Fire and forget - regenerate AI in background
		if (shouldRegenerateAI) {
			generateAIInBackground(
				existingWord.id,
				existingWord.term,
				userId,
				input.context ?? existingWord.context ?? undefined,
			).catch((err) =>
				console.error("Background AI regeneration error:", err),
			);
		}

		return { success: true, word: updated, aiPending: shouldRegenerateAI };
	}),

	// Remove word
	remove: protectedProcedure.input(removeWordInput).handler(async ({ context, input }) => {
		const userId = context.session?.user?.id;
		if (!userId) throw new ORPCError("UNAUTHORIZED", { message: "User not found" });

		const term = input.term.toLowerCase().trim();

		const deleted = await db
			.delete(word)
			.where(and(eq(word.userId, userId), eq(word.term, term)))
			.returning();

		if (deleted.length === 0) {
			throw new ORPCError("NOT_FOUND", { message: `Word "${term}" not found` });
		}

		return { success: true };
	}),

	// Search words
	search: protectedProcedure.input(searchWordsInput).handler(async ({ context, input }) => {
		const userId = context.session?.user?.id;
		if (!userId) throw new ORPCError("UNAUTHORIZED", { message: "User not found" });

		const query = `%${input.query}%`;

		const results = await db.query.word.findMany({
			where: and(
				eq(word.userId, userId),
				or(
					ilike(word.term, query),
					ilike(word.meaning, query),
					ilike(word.notes, query),
					ilike(word.memorableExplanation, query),
				),
			),
			limit: input.limit,
			with: {
				category: true,
			},
		});

		return { results, query: input.query };
	}),

	// Get graph data for visualization
	getGraphData: protectedProcedure.handler(async ({ context }) => {
		const userId = context.session?.user?.id;
		if (!userId) throw new ORPCError("UNAUTHORIZED", { message: "User not found" });

		const words = await db.query.word.findMany({
			where: eq(word.userId, userId),
			with: {
				category: true,
				outgoingRelationships: true,
			},
		});

		// Format for graph visualization
		const nodes = words.map((w) => ({
			id: w.id,
			label: w.term,
			category: w.category?.name,
			difficulty: w.difficulty,
		}));

		const edges = words.flatMap((w) =>
			w.outgoingRelationships.map((r) => ({
				source: r.sourceWordId,
				target: r.targetWordId,
				type: r.relationType,
				strength: r.strength,
			})),
		);

		return { nodes, edges };
	}),
};
