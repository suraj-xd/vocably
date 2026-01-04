"use client";

import { WebDemo } from "./demos/web-demo";
import { CliDemo } from "./demos/cli-demo";
import { AiDemo } from "./demos/ai-demo";

export function InteractiveDemoShowcase() {
	return (
		<section className="container mx-auto max-w-6xl px-4 py-16 border-t border-border">
			<h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-8">
				Three ways to manage
			</h2>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<DemoCard label="[WEB]" title="Browser Dashboard">
					<WebDemo />
				</DemoCard>
				<DemoCard label="[CLI]" title="Terminal Power">
					<CliDemo />
				</DemoCard>
				<DemoCard label="[AI]" title="AI-Native">
					<AiDemo />
				</DemoCard>
			</div>
		</section>
	);
}

function DemoCard({
	label,
	title,
	children,
}: {
	label: string;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="border border-border bg-card overflow-hidden flex flex-col rounded-[6px]">
			<div className="p-4 border-b border-border">
				<p className="text-xs text-muted-foreground font-mono mb-1">{label}</p>
				<p className="text-sm font-medium">{title}</p>
			</div>
			<div className="relative aspect-[4/3] overflow-hidden bg-background">
				{children}
			</div>
		</div>
	);
}
