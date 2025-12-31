import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { apiRequest, ApiError } from "../lib/api-client";

interface Word {
	id: string;
	term: string;
	meaning?: string;
	category?: { name: string } | null;
	createdAt: string;
}

interface ListResponse {
	words: Word[];
}

export const listCommand = new Command("list")
	.description("List all vocabulary words")
	.option("-l, --limit <number>", "Number of words to show", "20")
	.option("--category <category>", "Filter by category")
	.action(async (options) => {
		const spinner = ora("Fetching vocabulary...").start();

		try {
			const result = await apiRequest<ListResponse>("/rpc/words/list", {
				method: "POST",
				body: {
					limit: Number.parseInt(options.limit, 10),
					...(options.category && { category: options.category }),
				},
			});

			spinner.stop();

			if (result.words.length === 0) {
				console.log(chalk.yellow("No words found."));
				console.log(chalk.dim("Add your first word with: vocably add <word>"));
				return;
			}

			console.log(chalk.bold(`\nYour Vocabulary (${result.words.length} words)\n`));

			for (const word of result.words) {
				console.log(chalk.green(`  ${word.term}`));
				if (word.meaning) {
					console.log(chalk.dim(`    ${word.meaning.slice(0, 80)}${word.meaning.length > 80 ? "..." : ""}`));
				}
				if (word.category?.name) {
					console.log(chalk.blue(`    [${word.category.name}]`));
				}
				console.log();
			}
		} catch (error) {
			spinner.fail(chalk.red("Failed to fetch vocabulary"));
			if (error instanceof ApiError) {
				console.error(chalk.dim(`Error: ${error.message}`));
			} else {
				console.error(chalk.dim(error instanceof Error ? error.message : String(error)));
			}
			process.exit(1);
		}
	});
