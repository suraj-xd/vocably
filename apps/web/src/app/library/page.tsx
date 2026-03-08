"use client";

import { useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer";

import { TodayWordsSection } from "@/components/library/today-words-section";
import { LibraryWordGrid } from "@/components/library/library-word-grid";
import { client } from "@/utils/orpc";

const PAGE_SIZE = 20;

export default function LibraryPage() {
	const { ref, inView } = useInView();

	const {
		data,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery({
		queryKey: ["library", "list"],
		queryFn: ({ pageParam = 0 }) =>
			client.library.list({ limit: PAGE_SIZE, offset: pageParam }),
		getNextPageParam: (lastPage, allPages) => {
			if (!lastPage.hasMore) return undefined;
			return allPages.reduce((acc, page) => acc + page.words.length, 0);
		},
		initialPageParam: 0,
	});

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

	const allWords = data?.pages.flatMap((page) => page.words) ?? [];

	return (
		<div className="container mx-auto max-w-5xl px-4 py-8">
			<div className="mb-8">
				<h1 className="text-2xl font-medium mb-1">Library</h1>
				<p className="text-sm text-muted-foreground">
					A curated vocabulary collection, updated daily
				</p>
			</div>

			<TodayWordsSection />

			<section>
				<h2 className="text-lg font-medium mb-4">All Words</h2>

				{isLoading ? (
					<div className="flex items-center justify-center py-20">
						<Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
					</div>
				) : allWords.length === 0 ? (
					<div className="text-center py-20">
						<p className="text-muted-foreground">No words in the library yet.</p>
					</div>
				) : (
					<>
						<LibraryWordGrid words={allWords} />

						{/* Infinite scroll trigger */}
						<div ref={ref} className="flex justify-center py-8">
							{isFetchingNextPage && (
								<Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
							)}
						</div>
					</>
				)}
			</section>
		</div>
	);
}
