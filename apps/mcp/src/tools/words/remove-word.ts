import { z } from "zod";
import type { ToolMetadata } from "xmcp";
import { apiRequest, formatToolResponse, formatErrorResponse } from "../../lib/api";

export const schema = {
	term: z.string().describe("The vocabulary word to remove"),
};

export const metadata: ToolMetadata = {
	name: "remove-word",
	description: "Remove a vocabulary word from your collection",
	annotations: {
		title: "Remove Word",
		readOnlyHint: false,
		destructiveHint: true,
		idempotentHint: true,
	},
};

type SchemaType = {
	term: string;
};

export default async function removeWord(input: SchemaType) {
	try {
		await apiRequest("/rpc/words/remove", {
			method: "POST",
			body: { term: input.term },
		});

		return formatToolResponse({
			success: true,
			message: `Removed "${input.term}" from your vocabulary`,
		});
	} catch (error) {
		return formatErrorResponse(error);
	}
}
