import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { saveConfig, clearToken, getConfig, hasToken } from "../lib/config";

export const authCommand = new Command("auth")
	.description("Manage authentication");

authCommand
	.command("login")
	.description("Configure API token for authentication")
	.argument("<token>", "API token from your vocably dashboard")
	.action(async (token: string) => {
		const spinner = ora("Validating token...").start();

		try {
			// Validate token format
			if (!token.startsWith("vocably_")) {
				spinner.fail(chalk.red("Invalid token format. Token should start with 'vocably_'"));
				process.exit(1);
			}

			// Save the token
			saveConfig({ token });
			spinner.succeed(chalk.green("Token saved successfully!"));
			console.log(chalk.dim("\nYou can now use vocably commands."));
		} catch (error) {
			spinner.fail(chalk.red("Failed to save token"));
			console.error(error instanceof Error ? error.message : error);
			process.exit(1);
		}
	});

authCommand
	.command("logout")
	.description("Remove stored authentication token")
	.action(() => {
		clearToken();
		console.log(chalk.green("Logged out successfully."));
	});

authCommand
	.command("status")
	.description("Check authentication status")
	.action(() => {
		if (hasToken()) {
			const config = getConfig();
			console.log(chalk.green("Authenticated"));
			console.log(chalk.dim(`API URL: ${config.apiUrl}`));
			console.log(chalk.dim(`Token: ${config.token?.slice(0, 12)}...`));
		} else {
			console.log(chalk.yellow("Not authenticated"));
			console.log(chalk.dim("Run `vocably auth login <token>` to authenticate."));
		}
	});
