import { generateText, Output } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { env } from "@vocab/env/server";
import { db } from "@vocab/db";
import { userSettings } from "@vocab/db/schema";
import { eq } from "drizzle-orm";

// Schema for AI-generated vocabulary data (simplified for compatibility)
export const vocabularySchema = z.object({
	meaning: z.string(),
	partOfSpeech: z.string(),
	pronunciation: z.string(),
	memorableExplanation: z.string(),
	hindiTranslation: z.string(),
	hindiContext: z.string(),
	usageExamples: z.array(z.string()),
	synonyms: z.array(z.string()),
	antonyms: z.array(z.string()),
	difficulty: z.string(),
	category: z.string(),
	relatedWords: z.array(
		z.object({
			word: z.string(),
			relationshipType: z.string(),
			explanation: z.string(),
		}),
	),
});

export type VocabularyData = z.infer<typeof vocabularySchema>;

const SYSTEM_PROMPT = `You are an expert English vocabulary teacher for native Hindi speakers learning English.

Your task is to generate comprehensive vocabulary data that helps Hindi speakers learn and remember English words.

For the "memorableExplanation" field, use techniques like:
- VIVID IMAGERY: Paint mental pictures that stick in memory
- HINDI CONNECTIONS: Link to similar Hindi sounds, words, or concepts
- STORIES: Create mini-narratives around the word
- MNEMONICS: Memory tricks using the word's spelling or sound
- EMOTIONAL HOOKS: Connect to feelings or experiences

Make explanations that STICK in memory, not just inform. Be creative and engaging.

For Hindi translations, provide accurate Devanagari script translations.
For Hindi context, explain any connections to Hindi language or Indian culture.`;

// Get user's AI settings from database
async function getUserAISettings(userId: string) {
	const settings = await db.query.userSettings.findFirst({
		where: eq(userSettings.userId, userId),
	});
	return settings;
}

// Get the appropriate AI model based on user settings or server env vars
function getAIModel(provider: string | null, apiKey: string | null) {
	// If user has configured their own API key
	if (apiKey && provider) {
		if (provider === "openai") {
			const openai = createOpenAI({ apiKey });
			return { model: openai("gpt-4o-mini"), provider: "openai" };
		}
		if (provider === "anthropic") {
			const anthropic = createAnthropic({ apiKey });
			return { model: anthropic("claude-sonnet-4-5-20250929"), provider: "anthropic" };
		}
		if (provider === "google") {
			const google = createGoogleGenerativeAI({ apiKey });
			return { model: google("gemini-2.5-flash"), provider: "google" };
		}
	}

	// Fall back to server environment variables
	if (env.OPENAI_API_KEY) {
		const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY });
		return { model: openai("gpt-4o-mini"), provider: "openai" };
	}

	if (env.ANTHROPIC_API_KEY) {
		const anthropic = createAnthropic({ apiKey: env.ANTHROPIC_API_KEY });
		return { model: anthropic("claude-sonnet-4-5-20250929"), provider: "anthropic" };
	}

	if (env.GOOGLE_GENERATIVE_AI_API_KEY) {
		const google = createGoogleGenerativeAI({ apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY });
		return { model: google("gemini-2.5-flash"), provider: "google" };
	}

	return null;
}

export async function generateVocabularyData(
	term: string,
	userId: string,
	context?: string,
): Promise<{ data: VocabularyData; provider: string } | null> {
	// Get user's AI settings
	const settings = await getUserAISettings(userId);
	const result = getAIModel(settings?.aiProvider ?? null, settings?.aiApiKey ?? null);

	if (!result) {
		console.warn("No AI API key configured. Skipping AI generation.");
		return null;
	}

	const { model, provider: providerName } = result;

	try {
		const contextInfo = context ? ` Context: "${context}"` : "";

		const { output } = await generateText({
			model,
			output: Output.object({
				schema: vocabularySchema,
			}),
			system: SYSTEM_PROMPT,
			prompt: `Generate vocabulary data for: "${term}"${contextInfo}`,
		});

		if (!output) {
			console.error("AI generation returned no output");
			return null;
		}

		return { data: output, provider: providerName };
	} catch (error) {
		console.error("AI generation failed:", error);
		return null;
	}
}

// Check if AI is available for a user (checks user settings + server env vars)
export async function isAIAvailable(userId: string): Promise<boolean> {
	// Check user settings first
	const settings = await getUserAISettings(userId);
	if (settings?.aiApiKey) {
		return true;
	}

	// Fall back to server env vars
	return !!(env.OPENAI_API_KEY || env.ANTHROPIC_API_KEY || env.GOOGLE_GENERATIVE_AI_API_KEY);
}
