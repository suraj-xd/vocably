import { relations } from "drizzle-orm";
import {
	pgTable,
	text,
	timestamp,
	boolean,
	index,
	uuid,
	integer,
	date,
	unique,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { word } from "./words";

// Global daily word - same word for all users each day
export const dailyWord = pgTable(
	"daily_word",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		date: date("date").notNull().unique(), // 2025-01-15
		term: text("term").notNull(), // The word for that day
		wordIndex: integer("word_index").notNull(), // Index in curated list
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [index("daily_word_date_idx").on(table.date)],
);

// Track which users received which daily words
export const userDailyWord = pgTable(
	"user_daily_word",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		dailyWordId: uuid("daily_word_id")
			.notNull()
			.references(() => dailyWord.id, { onDelete: "cascade" }),
		wordId: uuid("word_id").references(() => word.id, { onDelete: "set null" }), // The actual word created (null if skipped)
		skipped: boolean("skipped").default(false), // True if user already had the word
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("user_daily_word_user_idx").on(table.userId),
		index("user_daily_word_daily_idx").on(table.dailyWordId),
		unique("user_daily_word_unique").on(table.userId, table.dailyWordId),
	],
);

// Relations
export const dailyWordRelations = relations(dailyWord, ({ many }) => ({
	userDailyWords: many(userDailyWord),
}));

export const userDailyWordRelations = relations(userDailyWord, ({ one }) => ({
	user: one(user, {
		fields: [userDailyWord.userId],
		references: [user.id],
	}),
	dailyWord: one(dailyWord, {
		fields: [userDailyWord.dailyWordId],
		references: [dailyWord.id],
	}),
	word: one(word, {
		fields: [userDailyWord.wordId],
		references: [word.id],
	}),
}));
