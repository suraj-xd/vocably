"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { Loader2, Plus } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { subDays, subMonths } from "date-fns";

import { authClient } from "@/lib/auth-client";
import { WordGrid } from "@/components/vocab/word-grid";
import { SkeletonCards } from "@/components/vocab/skeleton-cards";
import { AddWordDialog } from "@/components/vocab/add-word-dialog";
import { SearchBar } from "@/components/vocab/search-bar";
import { WordOfDayCard } from "@/components/vocab/word-of-day-card";
import { OnboardingDialog } from "@/components/onboarding";
import { Button } from "@/components/ui/button";
import { FilterMenu } from "@/components/vocab/filter-menu";
import { StatsInsight } from "@/components/vocab/stats-insight";
import { ActiveFilterChip } from "@/components/vocab/active-filter-chip";
import type { DateFilterState } from "@/components/vocab/date-filter";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { client } from "@/utils/orpc";

/**
 * Check if a string looks like a valid English word/phrase for quick-add
 * - Max 50 characters
 * - Max 4 words
 * - Only letters, spaces, hyphens, apostrophes
 */
function isValidPasteWord(text: string): boolean {
	const trimmed = text.trim();

	// Too long
	if (trimmed.length === 0 || trimmed.length > 50) return false;

	// Only allow letters, spaces, hyphens, apostrophes
	if (!/^[a-zA-Z\s\-']+$/.test(trimmed)) return false;

	// Max 4 words
	const words = trimmed.split(/\s+/);
	if (words.length > 4) return false;

	return true;
}

export default function Dashboard({
	session,
}: { session: typeof authClient.$Infer.Session }) {
	const [searchQuery] = useQueryState("q", { defaultValue: "", shallow: true });
	const isSearching = searchQuery.trim().length > 0;

	// Pagination state
	const [pageSize, setPageSize] = useLocalStorage("vocab-page-size", 50);
	const [allWords, setAllWords] = useState<any[]>([]);
	const [hasMore, setHasMore] = useState(true);
	const [total, setTotal] = useState(0);

	// Date filter state
	const [dateFilter, setDateFilter] = useLocalStorage<DateFilterState>(
		"vocab-date-filter",
		{ preset: "all" },
	);

	// Convert date filter to API params
	const { startDate, endDate } = useMemo(() => {
		const now = new Date();
		switch (dateFilter.preset) {
			case "all":
				return {};
			case "7d":
				return { startDate: subDays(now, 7).toISOString() };
			case "30d":
				return { startDate: subDays(now, 30).toISOString() };
			case "3m":
				return { startDate: subMonths(now, 3).toISOString() };
			case "custom":
				return {
					startDate: dateFilter.customStart?.toISOString(),
					endDate: dateFilter.customEnd?.toISOString(),
				};
			default:
				return {};
		}
	}, [dateFilter]);

	// Onboarding state
	const onboardingQuery = useQuery({
		queryKey: ["onboardingStatus"],
		queryFn: () => client.userSettings.getOnboardingStatus(),
		staleTime: Number.POSITIVE_INFINITY,
	});

	const showOnboarding =
		onboardingQuery.data && !onboardingQuery.data.isOnboarded;

	// Paste-to-add state
	const [addDialogOpen, setAddDialogOpen] = useState(false);
	const [pastedTerm, setPastedTerm] = useState("");

	// Handle paste event for quick word addition
	const handlePaste = useCallback(
		async (e: ClipboardEvent) => {
			if (addDialogOpen) return;

			const activeElement = document.activeElement;
			if (
				activeElement instanceof HTMLInputElement ||
				activeElement instanceof HTMLTextAreaElement ||
				activeElement?.getAttribute("contenteditable") === "true"
			) {
				return;
			}

			const text = e.clipboardData?.getData("text") ?? "";

			if (isValidPasteWord(text)) {
				e.preventDefault();
				setPastedTerm(text.trim());
				setAddDialogOpen(true);
			}
		},
		[addDialogOpen],
	);

	// Set up paste listener
	useEffect(() => {
		document.addEventListener("paste", handlePaste);
		return () => document.removeEventListener("paste", handlePaste);
	}, [handlePaste]);

	// Clear pasted term when dialog closes
	const handleDialogOpenChange = (open: boolean) => {
		setAddDialogOpen(open);
		if (!open) {
			setPastedTerm("");
		}
	};

	// Track when we last added/updated a word with AI to trigger polling
	const [lastAIOperationTime, setLastAIOperationTime] = useState<number | null>(
		null,
	);

	// Initial list query
	const listQuery = useQuery({
		queryKey: ["words", "list", pageSize, startDate, endDate],
		queryFn: async () => {
			const result = await client.words.list({
				limit: pageSize,
				offset: 0,
				startDate,
				endDate,
			});
			setAllWords(result.words);
			setTotal(result.total);
			setHasMore(result.hasMore);
			return result;
		},
		enabled: !isSearching,
		refetchInterval: (query) => {
			if (!lastAIOperationTime) return false;

			const now = Date.now();
			const elapsed = now - lastAIOperationTime;

			if (elapsed > 30_000) {
				return false;
			}

			const words = allWords ?? [];
			const hasPendingWords = words.some(
				(w) => w.aiStatus === "pending" || w.aiStatus === "generating",
			);

			return hasPendingWords ? 5_000 : false;
		},
	});

	// Search query
	const searchQueryResult = useQuery({
		queryKey: ["words", "search", searchQuery],
		queryFn: () => client.words.search({ query: searchQuery, limit: 50 }),
		enabled: isSearching,
	});

	// Load more function for infinite scroll
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const loadMore = async () => {
		if (isLoadingMore || !hasMore || isSearching) return;

		setIsLoadingMore(true);
		try {
			const result = await client.words.list({
				limit: pageSize,
				offset: allWords.length,
				startDate,
				endDate,
			});
			setAllWords((prev) => [...prev, ...result.words]);
			setHasMore(result.hasMore);
		} catch (error) {
			console.error("Failed to load more words:", error);
		} finally {
			setIsLoadingMore(false);
		}
	};

	// Infinite scroll sentinel
	const { ref: sentinelRef } = useInView({
		onChange: (inView) => {
			if (inView && hasMore && !isLoadingMore && !isSearching) {
				loadMore();
			}
		},
	});

	const activeQuery = isSearching ? searchQueryResult : listQuery;
	const isLoading = activeQuery.isLoading;
	const isError = activeQuery.isError;

	const refetchAll = async () => {
		if (isSearching) {
			await searchQueryResult.refetch();
		} else {
			const result = await listQuery.refetch();
			const words = result.data?.words ?? [];
			const hasPendingWords = words.some(
				(w) => w.aiStatus === "pending" || w.aiStatus === "generating",
			);

			if (hasPendingWords) {
				setLastAIOperationTime(Date.now());
			}
		}
	};

	const words = isSearching
		? (searchQueryResult.data?.results ?? [])
		: allWords;

	return (
		<div className="space-y-6">
			{showOnboarding && (
				<OnboardingDialog
					initialStep={onboardingQuery.data?.currentStep ?? 0}
				/>
			)}

			{!isSearching && <WordOfDayCard onWordAdded={refetchAll} />}

			<div className="flex flex-col gap-3">
				{/* Main header row */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
					<div>
						{isError ? (
							<p className="text-destructive text-sm">Failed to load vocabulary</p>
						) : isSearching ? (
							<p className="text-sm text-muted-foreground">
								{words.length} {words.length === 1 ? "result" : "results"} for "
								{searchQuery}"
							</p>
						) : (
							<StatsInsight />
						)}
					</div>
					<div className="flex items-center gap-3 flex-wrap">
						{!isSearching && (
							<>
								<ActiveFilterChip
									dateFilter={dateFilter}
									onClear={() => setDateFilter({ preset: "all" })}
								/>
								<FilterMenu
									pageSize={pageSize}
									onPageSizeChange={setPageSize}
									dateFilter={dateFilter}
									onDateFilterChange={setDateFilter}
								/>
							</>
						)}
						<SearchBar />
						<Button onClick={() => setAddDialogOpen(true)}>
							<Plus className="w-4 h-4 mr-2" />
							Add Word
						</Button>
						<AddWordDialog
							open={addDialogOpen}
							onOpenChange={handleDialogOpenChange}
							onSuccess={refetchAll}
							initialTerm={pastedTerm}
						/>
					</div>
				</div>
			</div>

			<div className="relative min-h-[120px]">
				{isError ? (
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<p className="text-destructive mb-3">Failed to load vocabulary</p>
						<button
							type="button"
							onClick={() => activeQuery.refetch()}
							className="text-sm underline underline-offset-2"
						>
							Try again
						</button>
					</div>
				) : (
					<>
						<WordGrid
							words={words}
							isLoading={isLoading}
							isSearching={isSearching}
							searchQuery={searchQuery}
							onUpdate={refetchAll}
						/>

						{/* Infinite scroll sentinel */}
						{!isSearching && hasMore && !isLoading && (
							<div ref={sentinelRef}>
								{isLoadingMore && <SkeletonCards count={3} />}
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
