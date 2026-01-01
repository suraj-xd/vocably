"use client";

import { BookOpen, Sparkles } from "lucide-react";

interface WelcomeStepProps {
	onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
	return (
		<div className="space-y-6 text-center py-4">
			<div className="flex justify-center">
				<div className="p-4 bg-primary/10 border border-primary/20">
					<BookOpen className="w-12 h-12 text-primary" />
				</div>
			</div>

			<div className="space-y-2">
				<h2 className="text-2xl font-bold tracking-tight">
					Welcome to Vocably
				</h2>
				<p className="text-muted-foreground max-w-sm mx-auto">
					Build your vocabulary with AI-powered definitions tailored to your
					native language.
				</p>
			</div>

			<div className="grid gap-3 text-left max-w-sm mx-auto">
				<div className="flex items-start gap-3 p-3 border bg-muted/30">
					<Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
					<div>
						<p className="font-medium text-sm">AI-Powered Learning</p>
						<p className="text-xs text-muted-foreground">
							Get definitions, examples, and translations in your language
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
