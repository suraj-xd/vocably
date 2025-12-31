"use client";

import { WordCard } from "./word-card";

interface Word {
	id: string;
	term: string;
	meaning?: string | null;
	notes?: string | null;
	context?: string | null;
	category?: { name: string } | null;
	difficulty?: string | null;
	createdAt: Date;
}

interface WordGridProps {
	words: Word[];
	onUpdate?: () => void;
}

export function WordGrid({ words, onUpdate }: WordGridProps) {
	if (words.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-20 text-center">
				<div className="text-6xl mb-4">📚</div>
				<h3 className="text-xl font-semibold mb-2">No words yet</h3>
				<p className="text-muted-foreground mb-4">
					Start building your vocabulary by adding your first word
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			{words.map((word) => (
				<WordCard key={word.id} word={word} onUpdate={onUpdate} />
			))}
		</div>
	);
}
