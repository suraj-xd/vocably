"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { Loader2, SearchX, Plus } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { WordGrid } from "@/components/vocab/word-grid";
import { AddWordDialog } from "@/components/vocab/add-word-dialog";
import { SearchBar } from "@/components/vocab/search-bar";
import { WordOfDayCard } from "@/components/vocab/word-of-day-card";
import { OnboardingDialog } from "@/components/onboarding";
import { Button } from "@/components/ui/button";
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

	// Onboarding state
	const onboardingQuery = useQuery({
		queryKey: ["onboardingStatus"],
		queryFn: () => client.userSettings.getOnboardingStatus(),
		staleTime: Number.POSITIVE_INFINITY, // Don't refetch automatically
	});

	const showOnboarding =
		onboardingQuery.data && !onboardingQuery.data.isOnboarded;

	// Paste-to-add state
	const [addDialogOpen, setAddDialogOpen] = useState(false);
	const [pastedTerm, setPastedTerm] = useState("");

	// Handle paste event for quick word addition
	const handlePaste = useCallback(
		async (e: ClipboardEvent) => {
			// Only intercept if dialog is closed
			if (addDialogOpen) return;

			// Don't intercept if user is focused on an input/textarea
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

	const listQuery = useQuery({
		queryKey: ["words", "list"],
		queryFn: () => client.words.list({ limit: 50, offset: 0 }),
		enabled: !isSearching,
		refetchInterval: (query) => {
			// Don't poll if no recent AI operation
			if (!lastAIOperationTime) return false;

			const now = Date.now();
			const elapsed = now - lastAIOperationTime;

			// Stop polling after 30 seconds
			if (elapsed > 30_000) {
				return false;
			}

			// Check if any words are still pending
			const words = query.state.data?.words ?? [];
			const hasPendingWords = words.some(
				(w) => w.aiStatus === "pending" || w.aiStatus === "generating",
			);

			// Poll every 5 seconds if we have pending words
			return hasPendingWords ? 5_000 : false;
		},
	});

	const searchQueryResult = useQuery({
		queryKey: ["words", "search", searchQuery],
		queryFn: () => client.words.search({ query: searchQuery, limit: 50 }),
		enabled: isSearching,
	});

	const activeQuery = isSearching ? searchQueryResult : listQuery;
	const isLoading = activeQuery.isLoading;
	const isFetching = activeQuery.isFetching;
	const isError = activeQuery.isError;
	const error = activeQuery.error;

	const refetchAll = async () => {
		const result = await listQuery.refetch();
		if (isSearching) searchQueryResult.refetch();

		// Check if any words are pending AI generation
		const words = result.data?.words ?? [];
		const hasPendingWords = words.some(
			(w) => w.aiStatus === "pending" || w.aiStatus === "generating",
		);

		// Start polling timer if we have pending words
		if (hasPendingWords) {
			setLastAIOperationTime(Date.now());
		}
	};

	const words = isSearching
		? (searchQueryResult.data?.results ?? [])
		: (listQuery.data?.words ?? []);

	return (
		<div className="space-y-6">
			{showOnboarding && (
				<OnboardingDialog
					initialStep={onboardingQuery.data?.currentStep ?? 0}
				/>
			)}

			{!isSearching && <WordOfDayCard onWordAdded={refetchAll} />}

			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					{isError ? (
						<p className="text-destructive">Failed to load vocabulary</p>
					) : isSearching ? (
						<p className="text-muted-foreground">
							{words.length} {words.length === 1 ? "result" : "results"} for "
							{searchQuery}"
						</p>
					) : (
						<p className="text-muted-foreground">
							{words.length} {words.length === 1 ? "word" : "words"} in your
							vocabulary
						</p>
					)}
				</div>
				<div className="flex items-center gap-4">
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

			<div className="relative min-h-[120px]">
				{isFetching && (
					<div className="absolute inset-0 flex items-center justify-center bg-background/70">
						<Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
					</div>
				)}

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
				) : isSearching && words.length === 0 && !isLoading ? (
					<div className="flex flex-col items-center justify-center py-20 text-center">
						<SearchX className="w-12 h-12 text-muted-foreground mb-4" />
						<p className="text-muted-foreground">
							No words found matching "{searchQuery}"
						</p>
						<p className="text-sm text-muted-foreground mt-2">
							Try a different search term or add a new word
						</p>
					</div>
				) : (
					<WordGrid words={words} onUpdate={refetchAll} />
				)}
			</div>
		</div>
	);
}
