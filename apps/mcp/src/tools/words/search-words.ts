import { z } from "zod";
import type { ToolMetadata } from "xmcp";
import { apiRequest, formatToolResponse, formatErrorResponse } from "../../lib/api";

export const schema = {
	query: z.string().describe("Search query to find vocabulary words"),
	limit: z
		.number()
		.optional()
		.default(10)
		.describe("Maximum number of results"),
};

export const metadata: ToolMetadata = {
	name: "search-words",
	description:
		"Search vocabulary words by term, meaning, or notes",
	annotations: {
		title: "Search Vocabulary",
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
	},
};

type SchemaType = {
	query: string;
	limit?: number;
};

export default async function searchWords(input: SchemaType) {
	try {
		const result = await apiRequest("/rpc/words/search", {
			method: "POST",
			body: {
				query: input.query,
				limit: input.limit || 10,
			},
		});

		return formatToolResponse(result);
	} catch (error) {
		return formatErrorResponse(error);
	}
}
