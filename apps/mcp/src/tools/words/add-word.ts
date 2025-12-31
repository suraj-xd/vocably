import { z } from "zod";
import type { ToolMetadata } from "xmcp";
import { apiRequest, formatToolResponse, formatErrorResponse } from "../../lib/api";

export const schema = {
	term: z.string().describe("The vocabulary word to add"),
	notes: z.string().optional().describe("Personal notes about the word"),
	context: z.string().optional().describe("Where you encountered the word"),
	generateAI: z
		.boolean()
		.optional()
		.default(true)
		.describe("Generate AI-powered definition"),
};

export const metadata: ToolMetadata = {
	name: "add-word",
	description:
		"Add a new vocabulary word to your collection. Optionally generates AI-powered definitions, examples, and related data.",
	annotations: {
		title: "Add Vocabulary Word",
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: false,
	},
};

type SchemaType = {
	term: string;
	notes?: string;
	context?: string;
	generateAI?: boolean;
};

export default async function addWord(input: SchemaType) {
	try {
		const result = await apiRequest("/rpc/words/add", {
			method: "POST",
			body: { ...input, source: "mcp" },
		});

		return formatToolResponse({
			success: true,
			message: `Added "${input.term}" to your vocabulary`,
			word: result,
		});
	} catch (error) {
		return formatErrorResponse(error);
	}
}
