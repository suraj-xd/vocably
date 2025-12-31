import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { apiRequest, ApiError } from "../lib/api-client";

interface Word {
	id: string;
	term: string;
	meaning?: string;
	category?: { name: string } | null;
}

interface SearchResponse {
	results: Word[];
	query: string;
}

export const searchCommand = new Command("search")
	.description("Search vocabulary words")
	.argument("<query>", "Search query")
	.action(async (query: string) => {
		const spinner = ora(`Searching for "${query}"...`).start();

		try {
			const result = await apiRequest<SearchResponse>("/rpc/words/search", {
				method: "POST",
				body: { query },
			});

			spinner.stop();

			if (result.results.length === 0) {
				console.log(chalk.yellow(`No results found for "${query}"`));
				return;
			}

			console.log(chalk.bold(`\nSearch results for "${query}" (${result.results.length})\n`));

			for (const word of result.results) {
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
			spinner.fail(chalk.red("Search failed"));
			if (error instanceof ApiError) {
				console.error(chalk.dim(`Error: ${error.message}`));
			} else {
				console.error(chalk.dim(error instanceof Error ? error.message : String(error)));
			}
			process.exit(1);
		}
	});
