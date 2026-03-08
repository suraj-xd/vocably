import {
	pgTable,
	text,
	timestamp,
	boolean,
	index,
	uuid,
	jsonb,
	date,
} from "drizzle-orm/pg-core";

// Public library words - no userId, standalone table
export const libraryWord = pgTable(
	"library_word",
	{
		id: uuid("id").defaultRandom().primaryKey(),

		// Core word data
		term: text("term").notNull().unique(),
		slug: text("slug").notNull().unique(),

		// AI-generated content (same fields as word table)
		meaning: text("meaning"),
		partOfSpeech: text("part_of_speech"),
		pronunciation: text("pronunciation"),
		memorableExplanation: text("memorable_explanation"),
		hindiTranslation: text("hindi_translation"),
		hindiContext: text("hindi_context"),
		etymology: text("etymology"),

		// JSON arrays
		usageExamples: jsonb("usage_examples").$type<string[]>().default([]),
		synonyms: jsonb("synonyms").$type<string[]>().default([]),
		antonyms: jsonb("antonyms").$type<string[]>().default([]),
		collocations: jsonb("collocations").$type<string[]>().default([]),
		topics: jsonb("topics").$type<string[]>().default([]),

		// Learning metadata
		difficulty: text("difficulty"), // beginner, intermediate, advanced

		// Category stored directly (no FK needed for public display)
		category: text("category"),

		// Publishing
		publishedAt: date("published_at").notNull(),

		// AI metadata
		aiGenerated: boolean("ai_generated").default(false),
		aiProvider: text("ai_provider"),
		aiStatus: text("ai_status").default("idle"), // idle, pending, generating, complete, error
		aiError: text("ai_error"),

		// Timestamps
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("library_word_slug_idx").on(table.slug),
		index("library_word_published_idx").on(table.publishedAt),
		index("library_word_term_idx").on(table.term),
	],
);
