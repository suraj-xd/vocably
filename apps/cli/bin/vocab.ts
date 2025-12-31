#!/usr/bin/env bun
import { Command } from "commander";
import { addCommand } from "../src/commands/add";
import { listCommand } from "../src/commands/list";
import { searchCommand } from "../src/commands/search";
import { removeCommand } from "../src/commands/remove";
import { authCommand } from "../src/commands/auth";
import { configCommand } from "../src/commands/config";

const program = new Command();

program
	.name("vocab")
	.description("Vocabulary management CLI - Learn and remember English words")
	.version("0.1.0");

program.addCommand(addCommand);
program.addCommand(listCommand);
program.addCommand(searchCommand);
program.addCommand(removeCommand);
program.addCommand(authCommand);
program.addCommand(configCommand);

program.parse();
