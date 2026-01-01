"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpeakButton } from "@/components/speak-button";
import { AddableWord } from "@/components/vocab/addable-word";
import { getLanguageName } from "@/components/language-selector";
import { client } from "@/utils/orpc";

export default function WordDetailPage() {
	const params = useParams();
	const router = useRouter();
	const wordId = params.id as string;

	const { data: word, isLoading, error } = useQuery({
		queryKey: ["words", "get", wordId],
		queryFn: () => client.words.get({ id: wordId }),
		enabled: !!wordId,
	});

	const { data: settings } = useQuery({
		queryKey: ["userSettings"],
		queryFn: () => client.userSettings.get(),
	});

	async function handleDelete() {
		if (!word?.term) return;

		if (!confirm(`Are you sure you want to delete "${word.term}"?`)) {
			return;
		}

		try {
			await client.words.remove({ term: word.term });
			toast.success(`Deleted "${word.term}"`);
			router.push("/dashboard");
		} catch (error) {
			toast.error("Failed to delete word");
		}
	}

	if (isLoading) {
		return (
			<div className="container mx-auto py-8 px-4">
				<div className="flex items-center justify-center py-20">
					<Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
				</div>
			</div>
		);
	}

	if (error || !word) {
		return (
			<div className="container mx-auto py-8 px-4">
				<Button variant="ghost" onClick={() => router.back()} className="mb-4">
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back
				</Button>
				<div className="text-center py-20">
					<p className="text-destructive">Word not found</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8 px-4 max-w-3xl">
			<div className="flex items-center justify-between mb-8">
				<Button variant="ghost" onClick={() => router.back()}>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back
				</Button>
				<Button variant="destructive" size="sm" onClick={handleDelete}>
					<Trash2 className="w-4 h-4 mr-2" />
					Delete
				</Button>
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
							<span className="px-2 py-0.5 bg-secondary">{word.category.name}</span>
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

				{/* Native Language Translation */}
				{(word.hindiTranslation || word.hindiContext) && (
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">
								{getLanguageName(settings?.nativeLanguage ?? "hi")} Context
							</CardTitle>
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
										<AddableWord key={syn} word={syn} />
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
										<AddableWord key={ant} word={ant} />
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Personal Notes */}
				{(word.notes || word.context) && (
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Your Notes</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							{word.notes && <p>{word.notes}</p>}
							{word.context && (
								<p className="text-sm text-muted-foreground">
									Found in: {word.context}
								</p>
							)}
						</CardContent>
					</Card>
				)}

				{/* Related Words (for future graph) */}
				{word.outgoingRelationships && word.outgoingRelationships.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Related Words</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-wrap gap-2">
								{word.outgoingRelationships.map((rel) => (
									<button
										key={rel.targetWord.id}
										type="button"
										onClick={() => router.push(`/dashboard/words/${rel.targetWord.id}`)}
										className="px-3 py-1 bg-secondary hover:bg-secondary/80 text-sm"
									>
										{rel.targetWord.term}
										<span className="text-xs text-muted-foreground ml-1">
											({rel.relationType})
										</span>
									</button>
								))}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Metadata */}
				<div className="text-xs text-muted-foreground pt-4 border-t">
					<div className="flex items-center gap-2 flex-wrap">
						<span>
							Added on{" "}
							{new Date(word.createdAt).toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</span>
						{word.source && (
							<span
								className={`px-2 py-0.5 text-xs ${
									word.source === "cli"
										? "bg-purple-500/10 text-purple-500"
										: word.source === "mcp"
											? "bg-blue-500/10 text-blue-500"
											: word.source === "word_of_day"
												? "bg-amber-500/10 text-amber-500"
												: "bg-secondary text-muted-foreground"
								}`}
							>
								{word.source === "cli"
									? "CLI"
									: word.source === "mcp"
										? "MCP"
										: word.source === "word_of_day"
											? "Daily Word"
											: "Web"}
							</span>
						)}
						{word.aiGenerated && word.aiProvider && (
							<span>• AI-generated via {word.aiProvider}</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
