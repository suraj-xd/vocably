"use client";

import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SpeakButton } from "@/components/speak-button";

interface LibraryWordCardProps {
	word: {
		slug: string;
		term: string;
		meaning?: string | null;
		category?: string | null;
		difficulty?: string | null;
		aiStatus?: string | null;
		aiError?: string | null;
	};
}

export function LibraryWordCard({ word }: LibraryWordCardProps) {
	return (
		<Link href={`/library/${word.slug}`}>
			<Card className="h-full hover:border-foreground/20 transition-colors cursor-pointer group">
				<CardHeader className="pb-2">
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-2">
							<h3 className="text-lg font-semibold group-hover:underline underline-offset-2">
								{word.term}
							</h3>
							<SpeakButton text={word.term} size="sm" />
						</div>
						{word.difficulty && (
							<span
								className={`text-xs px-2 py-0.5 ${
									word.difficulty === "beginner"
										? "bg-green-500/10 text-green-500"
										: word.difficulty === "intermediate"
											? "bg-yellow-500/10 text-yellow-500"
											: "bg-red-500/10 text-red-500"
								}`}
							>
								{word.difficulty}
							</span>
						)}
					</div>
					{word.category && (
						<span className="text-xs text-muted-foreground">
							{word.category}
						</span>
					)}
				</CardHeader>
				<CardContent>
					{word.aiStatus === "pending" || word.aiStatus === "generating" ? (
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Loader2 className="h-4 w-4 animate-spin" />
							<span>Generating definition...</span>
						</div>
					) : word.aiStatus === "error" ? (
						<div className="flex items-start gap-2 text-sm text-destructive">
							<AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
							<span className="line-clamp-2">{word.aiError || "AI generation failed"}</span>
						</div>
					) : word.meaning ? (
						<p className="text-sm text-muted-foreground line-clamp-3">
							{word.meaning}
						</p>
					) : (
						<p className="text-sm text-muted-foreground/50 italic">
							No definition yet
						</p>
					)}
				</CardContent>
			</Card>
		</Link>
	);
}
