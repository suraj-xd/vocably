import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { eq } from "drizzle-orm";

import { db } from "@vocably/db";
import { libraryWord } from "@vocably/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpeakButton } from "@/components/speak-button";

interface PageProps {
	params: Promise<{ word: string }>;
}

async function getWord(slug: string) {
	const result = await db
		.select()
		.from(libraryWord)
		.where(eq(libraryWord.slug, slug))
		.limit(1);

	return result[0] ?? null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { word: slug } = await params;
	const word = await getWord(slug);

	if (!word) {
		return { title: "Word Not Found" };
	}

	return {
		title: `${word.term} — Vocably Library`,
		description: word.meaning ?? `Learn the word "${word.term}" on Vocably.`,
	};
}

export default async function LibraryWordPage({ params }: PageProps) {
	const { word: slug } = await params;
	const word = await getWord(slug);

	if (!word) {
		notFound();
	}

	return (
		<div className="container mx-auto py-8 px-4 max-w-3xl">
			<div className="mb-8">
				<Link href="/library">
					<Button variant="ghost">
						<ArrowLeft className="w-4 h-4 mr-2" />
						Library
					</Button>
				</Link>
			</div>

			<div className="space-y-6">
				{/* Header */}
				<div>
					<div className="flex items-center gap-4 mb-2">
						<h1 className="text-4xl font-bold">{word.term}</h1>
						<SpeakButton text={word.term} size="lg" />
					</div>
					<div className="flex items-center gap-3 text-sm text-muted-foreground">
						{word.partOfSpeech && (
							<span className="italic">{word.partOfSpeech}</span>
						)}
						{word.pronunciation && <span>{word.pronunciation}</span>}
						{word.category && (
							<span className="px-2 py-0.5 bg-secondary">{word.category}</span>
						)}
						{word.difficulty && (
							<span
								className={`px-2 py-0.5 ${
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
				</div>

				{/* Definition */}
				{word.meaning && (
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Definition</CardTitle>
						</CardHeader>
						<CardContent>
							<p>{word.meaning}</p>
						</CardContent>
					</Card>
				)}

				{/* Memorable Explanation */}
				{word.memorableExplanation && (
					<Card className="border-primary/20 bg-primary/5">
						<CardHeader>
							<CardTitle className="text-lg">Remember It</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-foreground">{word.memorableExplanation}</p>
						</CardContent>
					</Card>
				)}

				{/* Hindi Context */}
				{(word.hindiTranslation || word.hindiContext) && (
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Hindi Context</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							{word.hindiTranslation && (
								<p>
									<span className="text-muted-foreground">Translation: </span>
									<span className="text-lg">{word.hindiTranslation}</span>
								</p>
							)}
							{word.hindiContext && (
								<p className="text-muted-foreground">{word.hindiContext}</p>
							)}
						</CardContent>
					</Card>
				)}

				{/* Etymology */}
				{word.etymology && (
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Etymology</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">{word.etymology}</p>
						</CardContent>
					</Card>
				)}

				{/* Usage Examples */}
				{word.usageExamples && word.usageExamples.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Examples</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="space-y-3">
								{word.usageExamples.map((example, i) => (
									<li key={i} className="text-muted-foreground pl-4 border-l-2 border-muted">
										{example}
									</li>
								))}
							</ul>
						</CardContent>
					</Card>
				)}

				{/* Synonyms & Antonyms */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{word.synonyms && word.synonyms.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Synonyms</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex flex-wrap gap-2">
									{word.synonyms.map((syn) => (
										<span
											key={syn}
											className="px-3 py-1 bg-secondary text-sm"
										>
											{syn}
										</span>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					{word.antonyms && word.antonyms.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Antonyms</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex flex-wrap gap-2">
									{word.antonyms.map((ant) => (
										<span
											key={ant}
											className="px-3 py-1 bg-secondary text-sm"
										>
											{ant}
										</span>
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</div>

				{/* CTA */}
				<div className="text-center py-8 border-t">
					<p className="text-sm text-muted-foreground mb-3">
						Want to track words and build your vocabulary?
					</p>
					<Link href="/login">
						<Button>Sign up for free</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
