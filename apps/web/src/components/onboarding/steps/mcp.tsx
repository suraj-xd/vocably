"use client";

import { useState } from "react";
import { Check, Copy, Bot, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";

const MCP_CONFIG = `{
  "mcpServers": {
    "vocably": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://vocab.surajgaud.com/api/mcp",
        "--header",
        "Authorization: Bearer YOUR_API_TOKEN"
      ]
    }
  }
}`;

export function McpStep() {
	const [copied, setCopied] = useState(false);

	async function copyConfig() {
		await navigator.clipboard.writeText(MCP_CONFIG);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<div className="space-y-4">
			<div className="text-center space-y-1">
				<p className="text-sm text-muted-foreground">
					Connect with Claude Desktop to add words directly from your AI
					conversations.
				</p>
			</div>

			<div className="border bg-muted/30">
				<div className="flex items-center justify-between p-3 border-b">
					<div className="flex items-center gap-2">
						<Bot className="w-4 h-4 text-muted-foreground" />
						<span className="text-sm font-medium">Claude Desktop Config</span>
					</div>
					<Button
						variant="ghost"
						size="xs"
						onClick={copyConfig}
						className="gap-1"
					>
						{copied ? (
							<>
								<Check className="w-3 h-3 text-primary" />
								Copied
							</>
						) : (
							<>
								<Copy className="w-3 h-3" />
								Copy
							</>
						)}
					</Button>
				</div>

				<pre className="p-3 text-xs font-mono overflow-x-auto">
					{MCP_CONFIG}
				</pre>
			</div>

			<div className="space-y-2">
				<p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
					Setup Steps
				</p>
				<ol className="space-y-2 text-sm">
					<li className="flex gap-2">
						<span className="text-muted-foreground">1.</span>
						<span>
							Open Claude Desktop settings (
							<kbd className="px-1 py-0.5 text-xs bg-muted border">
								Cmd+,
							</kbd>
							)
						</span>
					</li>
					<li className="flex gap-2">
						<span className="text-muted-foreground">2.</span>
						<span>
							Go to Developer → Edit Config
						</span>
					</li>
					<li className="flex gap-2">
						<span className="text-muted-foreground">3.</span>
						<span>Add the configuration above</span>
					</li>
					<li className="flex gap-2">
						<span className="text-muted-foreground">4.</span>
						<span>Replace token with your API token from Settings</span>
					</li>
				</ol>
			</div>

			<a
				href="https://modelcontextprotocol.io/quickstart/user"
				target="_blank"
				rel="noopener noreferrer"
				className="flex items-center justify-center gap-1 text-xs text-primary hover:underline"
			>
				Learn more about MCP
				<ExternalLink className="w-3 h-3" />
			</a>
		</div>
	);
}
