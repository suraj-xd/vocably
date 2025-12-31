import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { apiRequest, ApiError } from "../lib/api-client";

export const removeCommand = new Command("remove")
	.description("Remove a vocabulary word")
	.argument("<word>", "The word to remove")
	.option("-f, --force", "Skip confirmation")
	.action(async (word: string, _options) => {
		const spinner = ora(`Removing "${word}"...`).start();

		try {
			await apiRequest("/rpc/words/remove", {
				method: "POST",
				body: { term: word.toLowerCase().trim() },
			});

			spinner.succeed(chalk.green(`Removed "${word}"`));
		} catch (error) {
			spinner.fail(chalk.red(`Failed to remove "${word}"`));
			if (error instanceof ApiError) {
				console.error(chalk.dim(`Error: ${error.message}`));
				if (error.code === "NOT_FOUND") {
					console.error(chalk.dim("Tip: Use `vocably list` to see your existing words."));
				}
			} else {
				console.error(chalk.dim(error instanceof Error ? error.message : String(error)));
			}
			process.exit(1);
		}
	});
