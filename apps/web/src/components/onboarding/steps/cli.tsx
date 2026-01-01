"use client";

import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";

import { Button } from "@/components/ui/button";

const INSTALL_COMMANDS = [
	{
		id: "npm",
		label: "npm",
		command: "npm install -g @vocably/cli",
	},
	{
		id: "bun",
		label: "bun",
		command: "bun add -g @vocably/cli",
	},
	{
		id: "pnpm",
		label: "pnpm",
		command: "pnpm add -g @vocably/cli",
	},
] as const;

export function CliStep() {
	const [selectedPm, setSelectedPm] = useState<string>("npm");
	const [copied, setCopied] = useState(false);

	const selectedCommand =
		INSTALL_COMMANDS.find((c) => c.id === selectedPm)?.command || "";

	async function copyCommand() {
		await navigator.clipboard.writeText(selectedCommand);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<div className="space-y-4">
			<div className="text-center space-y-1">
				<p className="text-sm text-muted-foreground">
					Add words from your terminal. Great for quick lookups while coding.
				</p>
			</div>

			<div className="border bg-muted/30">
				<div className="flex items-center gap-2 p-3 border-b">
					<Terminal className="w-4 h-4 text-muted-foreground" />
					<span className="text-sm font-medium">Install CLI</span>
				</div>

				<div className="p-3 space-y-3">
					<div className="flex gap-1">
						{INSTALL_COMMANDS.map((cmd) => (
							<Button
								key={cmd.id}
								variant={selectedPm === cmd.id ? "default" : "outline"}
								size="xs"
								onClick={() => setSelectedPm(cmd.id)}
							>
								{cmd.label}
							</Button>
						))}
					</div>

					<div className="flex items-center gap-2 bg-background p-2 border font-mono text-sm">
						<code className="flex-1 text-xs">{selectedCommand}</code>
						<Button
							variant="ghost"
							size="icon-xs"
							onClick={copyCommand}
							className="flex-shrink-0"
						>
							{copied ? (
								<Check className="w-3 h-3 text-primary" />
							) : (
								<Copy className="w-3 h-3" />
							)}
						</Button>
					</div>
				</div>
			</div>

			<div className="space-y-2">
				<p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
					Usage
				</p>
				<div className="space-y-1.5 font-mono text-xs">
					<div className="flex items-center gap-2 p-2 bg-muted/30 border">
						<code className="text-primary">vocab add</code>
						<span className="text-muted-foreground">serendipity</span>
					</div>
					<div className="flex items-center gap-2 p-2 bg-muted/30 border">
						<code className="text-primary">vocab list</code>
					</div>
					<div className="flex items-center gap-2 p-2 bg-muted/30 border">
						<code className="text-primary">vocab search</code>
						<span className="text-muted-foreground">happy</span>
					</div>
				</div>
			</div>

			<p className="text-xs text-muted-foreground text-center">
				You'll need to run <code className="text-foreground">vocab auth</code>{" "}
				to connect with your API token.
			</p>
		</div>
	);
}
