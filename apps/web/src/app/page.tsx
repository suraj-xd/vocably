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
			<main className="flex-1">
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

				{/* Install Section */}
				<section className="container mx-auto max-w-5xl px-4 py-16 border-t border-border">
					<h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-8">
						Quick start
					</h2>
					<div className="grid md:grid-cols-2 gap-8">
						<div>
							<p className="text-sm mb-4">Install the CLI</p>
							<pre className="text-xs bg-card p-4 border border-border overflow-x-auto">
								<code>npm install -g @vocab/cli</code>
							</pre>
						</div>
						<div>
							<p className="text-sm mb-4">Or use the MCP server</p>
							<pre className="text-xs bg-card p-4 border border-border overflow-x-auto">
								<code>npx @vocab/mcp</code>
							</pre>
						</div>
					</div>
				</section>
			</main>

			<Footer />
		</div>
	);
}
