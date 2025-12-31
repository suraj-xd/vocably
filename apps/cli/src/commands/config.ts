import { Command } from "commander";
import chalk from "chalk";
import { getConfig, saveConfig } from "../lib/config";

export const configCommand = new Command("config")
	.description("Manage CLI configuration");

configCommand
	.command("show")
	.description("Show current configuration")
	.action(() => {
		const config = getConfig();
		console.log(chalk.bold("\nVocab CLI Configuration\n"));
		console.log(`  API URL: ${chalk.cyan(config.apiUrl)}`);
		console.log(`  Token:   ${config.token ? chalk.green(`${config.token.slice(0, 12)}...`) : chalk.yellow("Not set")}`);
		console.log();
	});

configCommand
	.command("set")
	.description("Set a configuration value")
	.argument("<key>", "Configuration key (apiUrl)")
	.argument("<value>", "Configuration value")
	.action((key: string, value: string) => {
		if (key === "apiUrl") {
			saveConfig({ apiUrl: value });
			console.log(chalk.green(`Set apiUrl to ${value}`));
		} else {
			console.log(chalk.red(`Unknown configuration key: ${key}`));
			console.log(chalk.dim("Available keys: apiUrl"));
			process.exit(1);
		}
	});
