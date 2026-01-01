"use client";

import Link from "next/link";

import { AsciiHero } from "@/components/landing/ascii-hero";
import { FeatureCard } from "@/components/landing/feature-card";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function Home() {
	const { data: session } = authClient.useSession();

	return (
		<div className="flex flex-col min-h-full">
			<div className="flex-1">
				{/* Hero Section */}
				<section className="container mx-auto max-w-5xl px-4 py-16 md:py-24">
					<div className="flex flex-col items-center text-center gap-8">
						<AsciiHero />
						<p className="text-muted-foreground text-sm md:text-base max-w-md">
							Build your vocabulary. Anywhere.
						</p>
						<div className="flex gap-4">
							{session ? (
								<Link href="/dashboard">
									<Button>Go to Dashboard</Button>
								</Link>
							) : (
								<Link href="/login">
									<Button>Get Started</Button>
								</Link>
							)}
						</div>
					</div>
				</section>

				{/* Features Section */}
				<section className="container mx-auto max-w-5xl px-4 py-16 border-t border-border">
					<h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-8">
						Three ways to learn
					</h2>
					<div className="grid md:grid-cols-3 gap-6">
						<FeatureCard
							icon="[WEB]"
							title="Browser Dashboard"
							description="Visual interface for managing your vocabulary. Track progress, review words, and see AI-powered insights."
						/>
						<FeatureCard
							icon="[CLI]"
							title="Terminal Power"
							description="Add words from anywhere in your terminal. Fast, scriptable, and keyboard-driven."
							code="$ vocab add serendipity"
						/>
						<FeatureCard
							icon="[MCP]"
							title="AI-Native"
							description="Works directly with Claude. Add and review vocabulary without leaving your conversation."
						/>
					</div>
				</section>

				{/* How it works */}
				<section className="container mx-auto max-w-5xl px-4 py-16 border-t border-border">
					<h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-8">
						How it works
					</h2>
					<div className="grid gap-6 text-sm">
						<div className="flex gap-4 items-start">
							<span className="text-muted-foreground font-mono">01</span>
							<div>
								<p className="font-medium">Add a word</p>
								<p className="text-muted-foreground">
									From the web, CLI, or through Claude
								</p>
							</div>
						</div>
						<div className="flex gap-4 items-start">
							<span className="text-muted-foreground font-mono">02</span>
							<div>
								<p className="font-medium">AI enrichment</p>
								<p className="text-muted-foreground">
									Get definitions, examples, Hindi translations, and mnemonics
								</p>
							</div>
						</div>
						<div className="flex gap-4 items-start">
							<span className="text-muted-foreground font-mono">03</span>
							<div>
								<p className="font-medium">Review and learn</p>
								<p className="text-muted-foreground">
									Track your progress across all platforms
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* AI Integration Section */}
				<section className="container mx-auto max-w-5xl px-4 py-16 border-t border-border">
					<h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-8">
						AI Integration
					</h2>
					<div className="grid gap-8">
						<div className="grid md:grid-cols-2 gap-8">
							<div>
								<p className="text-sm font-medium mb-2">Claude Desktop</p>
								<p className="text-xs text-muted-foreground mb-4">
									Add to your claude_desktop_config.json
								</p>
								<pre className="text-xs bg-card p-4 border border-border overflow-x-auto whitespace-pre">
									<code>{`{
  "mcpServers": {
    "vocably": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://vocab.surajgaud.com/api/mcp",
        "--header",
        "Authorization: Bearer YOUR_TOKEN"
      ]
    }
  }
}`}</code>
								</pre>
							</div>
							<div>
								<p className="text-sm font-medium mb-2">Claude Code</p>
								<p className="text-xs text-muted-foreground mb-4">
									Add to your .mcp.json or settings
								</p>
								<pre className="text-xs bg-card p-4 border border-border overflow-x-auto whitespace-pre">
									<code>{`{
  "mcpServers": {
    "vocably": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://vocab.surajgaud.com/api/mcp",
        "--header",
        "Authorization: Bearer YOUR_TOKEN"
      ]
    }
  }
}`}</code>
								</pre>
							</div>
						</div>
						<div className="bg-card border border-border p-4">
							<p className="text-sm font-medium mb-2">Available Tools</p>
							<div className="grid md:grid-cols-5 gap-4 text-xs">
								<div>
									<code className="text-muted-foreground">add-word</code>
									<p className="text-muted-foreground mt-1">Add new vocabulary</p>
								</div>
								<div>
									<code className="text-muted-foreground">list-words</code>
									<p className="text-muted-foreground mt-1">List your words</p>
								</div>
								<div>
									<code className="text-muted-foreground">get-word</code>
									<p className="text-muted-foreground mt-1">Get word details</p>
								</div>
								<div>
									<code className="text-muted-foreground">search-words</code>
									<p className="text-muted-foreground mt-1">Search vocabulary</p>
								</div>
								<div>
									<code className="text-muted-foreground">remove-word</code>
									<p className="text-muted-foreground mt-1">Remove a word</p>
								</div>
							</div>
						</div>
						<p className="text-xs text-muted-foreground">
							Get your API token from{" "}
							<Link
								href="/dashboard/settings/api-keys"
								className="underline hover:text-foreground transition-colors"
							>
								Settings → API Keys
							</Link>{" "}
							after signing up.
						</p>
					</div>
				</section>

				{/* Quick Start Section */}
				<section className="container mx-auto max-w-5xl px-4 py-16 border-t border-border">
					<h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-8">
						Quick start
					</h2>
					<div className="grid md:grid-cols-2 gap-8">
						<div>
							<p className="text-sm font-medium mb-2">1. Create an account</p>
							<p className="text-xs text-muted-foreground mb-4">
								Sign up to get your API token
							</p>
							<Link href="/login">
								<Button variant="outline" className="text-xs">
									Get Started
								</Button>
							</Link>
						</div>
						<div>
							<p className="text-sm font-medium mb-2">2. Install the CLI</p>
							<p className="text-xs text-muted-foreground mb-4">
								Optional: manage vocabulary from terminal
							</p>
							<pre className="text-xs bg-card p-4 border border-border overflow-x-auto">
								<code>npm install -g vocably-cli</code>
							</pre>
						</div>
					</div>
				</section>
			</div>

			<Footer />
		</div>
	);
}
