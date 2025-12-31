import { z } from "zod";
import type { ToolMetadata } from "xmcp";
import { apiRequest, formatToolResponse, formatErrorResponse } from "../../lib/api";

export const schema = {
	term: z.string().describe("The vocabulary word to get details for"),
};

export const metadata: ToolMetadata = {
	name: "get-word",
	description:
		"Get detailed information about a specific vocabulary word including definition, examples, and related words",
	annotations: {
		title: "Get Word Details",
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
	},
};

type SchemaType = {
	term: string;
};

export default async function getWord(input: SchemaType) {
	try {
		const result = await apiRequest("/rpc/words/getByTerm", {
			method: "POST",
			body: { term: input.term },
		});

		return formatToolResponse(result);
	} catch (error) {
		return formatErrorResponse(error);
	}
}
