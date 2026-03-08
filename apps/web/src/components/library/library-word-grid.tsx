import { LibraryWordCard } from "./library-word-card";

interface LibraryWord {
	id: string;
	slug: string;
	term: string;
	meaning?: string | null;
	category?: string | null;
	difficulty?: string | null;
	aiStatus?: string | null;
	aiError?: string | null;
}

interface LibraryWordGridProps {
	words: LibraryWord[];
}

export function LibraryWordGrid({ words }: LibraryWordGridProps) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			{words.map((word) => (
				<LibraryWordCard key={word.id} word={word} />
			))}
		</div>
	);
}
