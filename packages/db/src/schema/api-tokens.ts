import { relations } from "drizzle-orm";
import {
	pgTable,
	text,
	timestamp,
	boolean,
	index,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// API Tokens for CLI and MCP authentication
export const apiToken = pgTable(
	"api_token",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),

		name: text("name").notNull(), // "CLI Token", "MCP Server", etc.
		tokenHash: text("token_hash").notNull(), // SHA-256 hash (never store plain)
		tokenPrefix: text("token_prefix").notNull(), // First 12 chars for identification "vocab_xxxx"

		// Permissions (for future granular control)
		permissions: text("permissions").array(), // ["read", "write", "delete"]

		// Usage tracking
		lastUsedAt: timestamp("last_used_at"),
		lastUsedIp: text("last_used_ip"),

		// Status
		isActive: boolean("is_active").default(true).notNull(),
		expiresAt: timestamp("expires_at"),

		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("api_token_user_idx").on(table.userId),
		index("api_token_hash_idx").on(table.tokenHash),
		index("api_token_active_idx").on(table.userId, table.isActive),
	],
);

// Relations
export const apiTokenRelations = relations(apiToken, ({ one }) => ({
	user: one(user, {
		fields: [apiToken.userId],
		references: [user.id],
	}),
}));
