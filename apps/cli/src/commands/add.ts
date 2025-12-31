import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { apiRequest, ApiError } from "../lib/api-client";

interface AddWordResponse {
	success: boolean;
	word: {
		id: string;
		term: string;
		meaning?: string;
		category?: string;
	};
}

export const addCommand = new Command("add")
	.description("Add a new vocabulary word")
	.argument("<word>", "The word to add")
	.option("-n, --notes <notes>", "Add personal notes about the word")
	.option("-c, --context <context>", "Where you encountered the word")
	.option("--no-ai", "Skip AI-powered definition generation")
	.action(async (word: string, options) => {
		const spinner = ora(`Adding "${word}"...`).start();

		try {
			const result = await apiRequest<AddWordResponse>("/rpc/words/add", {
				method: "POST",
				body: {
					term: word.toLowerCase().trim(),
					notes: options.notes,
					context: options.context,
					generateAI: options.ai !== false,
					source: "cli",
				},
			});

			spinner.succeed(chalk.green(`Added "${word}"`));

			if (result.word.meaning) {
				console.log(chalk.dim(`\nMeaning: ${result.word.meaning}`));
			}
			if (result.word.category) {
				console.log(chalk.dim(`Category: ${result.word.category}`));
			}
			console.log(chalk.dim(`ID: ${result.word.id}`));
		} catch (error) {
			spinner.fail(chalk.red(`Failed to add "${word}"`));
			if (error instanceof ApiError) {
				console.error(chalk.dim(`Error: ${error.message}`));
				if (error.code === "CONFLICT") {
					console.error(chalk.dim("Tip: Use `vocab list` to see your existing words."));
				}
			} else {
				console.error(chalk.dim(error instanceof Error ? error.message : String(error)));
			}
			process.exit(1);
		}
	});
