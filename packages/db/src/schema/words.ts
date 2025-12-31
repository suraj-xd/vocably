import { relations } from "drizzle-orm";
import {
	pgTable,
	text,
	timestamp,
	boolean,
	index,
	uuid,
	jsonb,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// Categories table - AI-generated freely
export const category = pgTable(
	"category",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		description: text("description"),
		color: text("color"), // Hex color for UI
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("category_user_idx").on(table.userId),
		index("category_name_idx").on(table.userId, table.name),
	],
);

// Main vocabulary word table
export const word = pgTable(
	"word",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),

		// Core word data
		term: text("term").notNull(),
		categoryId: uuid("category_id").references(() => category.id, {
			onDelete: "set null",
		}),

		// AI-generated content
		meaning: text("meaning"),
		partOfSpeech: text("part_of_speech"),
		pronunciation: text("pronunciation"),
		memorableExplanation: text("memorable_explanation"),
		hindiTranslation: text("hindi_translation"),
		hindiContext: text("hindi_context"),
		etymology: text("etymology"),

		// JSON arrays for lists
		usageExamples: jsonb("usage_examples").$type<string[]>().default([]),
		synonyms: jsonb("synonyms").$type<string[]>().default([]),
		antonyms: jsonb("antonyms").$type<string[]>().default([]),
		collocations: jsonb("collocations").$type<string[]>().default([]),
		topics: jsonb("topics").$type<string[]>().default([]),

		// Learning metadata
		difficulty: text("difficulty"), // beginner, intermediate, advanced

		// User additions
		notes: text("notes"),
		context: text("context"), // Where user encountered the word

		// AI metadata
		aiGenerated: boolean("ai_generated").default(false),
		aiProvider: text("ai_provider"),
		aiStatus: text("ai_status").default("idle"), // idle, pending, generating, complete, error
		aiError: text("ai_error"), // Error message if AI generation failed

		// Source tracking - where the word was added from
		source: text("source").default("web"), // web, cli, mcp, word_of_day

		// Timestamps
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("word_user_idx").on(table.userId),
		index("word_term_idx").on(table.userId, table.term),
		index("word_category_idx").on(table.categoryId),
		index("word_created_idx").on(table.createdAt),
	],
);

// Word relationships for graph visualization
export const wordRelationship = pgTable(
	"word_relationship",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),

		sourceWordId: uuid("source_word_id")
			.notNull()
			.references(() => word.id, { onDelete: "cascade" }),
		targetWordId: uuid("target_word_id")
			.notNull()
			.references(() => word.id, { onDelete: "cascade" }),

		// Relationship type for graph edges
		relationType: text("relation_type").notNull(), // synonym, antonym, related_concept, derived_from, etc.
		strength: text("strength").default("0.5"), // Edge weight for graph (0.0 - 1.0)
		explanation: text("explanation"),

		// Source of relationship
		source: text("source").default("ai"), // ai, user

		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("word_rel_source_idx").on(table.sourceWordId),
		index("word_rel_target_idx").on(table.targetWordId),
		index("word_rel_user_idx").on(table.userId),
	],
);

// Tags for user-defined organization
export const tag = pgTable(
	"tag",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("tag_user_idx").on(table.userId),
		index("tag_name_idx").on(table.userId, table.name),
	],
);

// Word-Tag junction table
export const wordTag = pgTable(
	"word_tag",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		wordId: uuid("word_id")
			.notNull()
			.references(() => word.id, { onDelete: "cascade" }),
		tagId: uuid("tag_id")
			.notNull()
			.references(() => tag.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("word_tag_word_idx").on(table.wordId),
		index("word_tag_tag_idx").on(table.tagId),
	],
);

// Relations
export const categoryRelations = relations(category, ({ one, many }) => ({
	user: one(user, {
		fields: [category.userId],
		references: [user.id],
	}),
	words: many(word),
}));

export const wordRelations = relations(word, ({ one, many }) => ({
	user: one(user, {
		fields: [word.userId],
		references: [user.id],
	}),
	category: one(category, {
		fields: [word.categoryId],
		references: [category.id],
	}),
	wordTags: many(wordTag),
	outgoingRelationships: many(wordRelationship, {
		relationName: "sourceWord",
	}),
	incomingRelationships: many(wordRelationship, {
		relationName: "targetWord",
	}),
}));

export const wordRelationshipRelations = relations(
	wordRelationship,
	({ one }) => ({
		user: one(user, {
			fields: [wordRelationship.userId],
			references: [user.id],
		}),
		sourceWord: one(word, {
			fields: [wordRelationship.sourceWordId],
			references: [word.id],
			relationName: "sourceWord",
		}),
		targetWord: one(word, {
			fields: [wordRelationship.targetWordId],
			references: [word.id],
			relationName: "targetWord",
		}),
	}),
);

export const tagRelations = relations(tag, ({ one, many }) => ({
	user: one(user, {
		fields: [tag.userId],
		references: [user.id],
	}),
	wordTags: many(wordTag),
}));

export const wordTagRelations = relations(wordTag, ({ one }) => ({
	word: one(word, {
		fields: [wordTag.wordId],
		references: [word.id],
	}),
	tag: one(tag, {
		fields: [wordTag.tagId],
		references: [tag.id],
	}),
}));
