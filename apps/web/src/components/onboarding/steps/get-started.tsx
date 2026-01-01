"use client";

import {
	Sparkles,
	BookOpen,
	Terminal,
	Bot,
	ArrowRight,
} from "lucide-react";

interface GetStartedStepProps {
	hasApiKey: boolean;
}

export function GetStartedStep({ hasApiKey }: GetStartedStepProps) {
	return (
		<div className="space-y-6 text-center py-2">
			<div className="space-y-2">
				<h2 className="text-xl font-bold tracking-tight">You're All Set!</h2>
				<p className="text-muted-foreground text-sm max-w-sm mx-auto">
					Start building your vocabulary. Here's what you can do:
				</p>
			</div>

			<div className="grid gap-3 text-left max-w-sm mx-auto">
				<FeatureCard
					icon={BookOpen}
					title="Add your first word"
					description="Click 'Add Word' or paste any word"
					available
				/>
				<FeatureCard
					icon={Sparkles}
					title="AI-powered definitions"
					description="Get translations in your language"
					available={hasApiKey}
					unavailableText="Add API key in Settings"
				/>
				<FeatureCard
					icon={Terminal}
					title="Use the CLI"
					description="vocab add <word> from terminal"
					available
				/>
				<FeatureCard
					icon={Bot}
					title="Claude Desktop"
					description="Add words from AI conversations"
					available
				/>
			</div>

			<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
				<ArrowRight className="w-4 h-4" />
				<span>Let's add your first word!</span>
			</div>
		</div>
	);
}

function FeatureCard({
	icon: Icon,
	title,
	description,
	available,
	unavailableText,
}: {
	icon: React.ComponentType<{ className?: string }>;
	title: string;
	description: string;
	available: boolean;
	unavailableText?: string;
}) {
	return (
		<div
			className={`flex items-start gap-3 p-3 border ${
				available ? "bg-muted/30" : "bg-muted/10 opacity-60"
			}`}
		>
			<Icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
			<div>
				<p className="font-medium text-sm">{title}</p>
				<p className="text-xs text-muted-foreground">
					{available ? description : unavailableText || description}
				</p>
			</div>
		</div>
	);
}
