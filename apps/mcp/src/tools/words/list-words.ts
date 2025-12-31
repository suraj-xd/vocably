import { z } from "zod";
import type { ToolMetadata } from "xmcp";
import { apiRequest, formatToolResponse, formatErrorResponse } from "../../lib/api";

export const schema = {
	limit: z
		.number()
		.optional()
		.default(20)
		.describe("Maximum number of words to return"),
	category: z.string().optional().describe("Filter by category"),
};

export const metadata: ToolMetadata = {
	name: "list-words",
	description: "List all vocabulary words in your collection",
	annotations: {
		title: "List Vocabulary",
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
	},
};

type SchemaType = {
	limit?: number;
	category?: string;
};

export default async function listWords(input: SchemaType) {
	try {
		const result = await apiRequest("/rpc/words/list", {
			method: "POST",
			body: {
				limit: input.limit || 20,
				...(input.category && { category: input.category }),
			},
		});

		return formatToolResponse(result);
	} catch (error) {
		return formatErrorResponse(error);
	}
}
