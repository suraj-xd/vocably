"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/utils/orpc";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsInsight() {
	const statsQuery = useQuery({
		queryKey: ["words", "stats"],
		queryFn: () => client.words.stats(),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	if (statsQuery.isLoading) {
		return <Skeleton className="h-5 w-48" />;
	}

	if (statsQuery.isError || !statsQuery.data) {
		return (
			<p className="text-sm text-muted-foreground">
				Your vocabulary collection
			</p>
		);
	}

	const { total, yesterday, thisWeek } = statsQuery.data;

	// No words at all
	if (total === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				Let's start building your vocabulary
			</p>
		);
	}

	// Just getting started (1-5 words)
	if (total <= 5) {
		return (
			<p className="text-sm text-muted-foreground">
				Great start! You've added {total} {total === 1 ? "word" : "words"}
			</p>
		);
	}

	// Very active this week (10+ words)
	if (thisWeek >= 10) {
		return (
			<p className="text-sm text-muted-foreground">
				<span className="hidden sm:inline">🔥 {thisWeek} words this week, {total} total</span>
				<span className="sm:hidden">🔥 {thisWeek} this week</span>
			</p>
		);
	}

	// Active yesterday
	if (yesterday > 0) {
		return (
			<p className="text-sm text-muted-foreground">
				<span className="hidden sm:inline">Added {yesterday} yesterday, {total} total</span>
				<span className="sm:hidden">Added {yesterday} yesterday</span>
			</p>
		);
	}

	// Active this week (but not yesterday)
	if (thisWeek > 0) {
		return (
			<p className="text-sm text-muted-foreground">
				<span className="hidden sm:inline">Added {thisWeek} this week, {total} total</span>
				<span className="sm:hidden">Added {thisWeek} this week</span>
			</p>
		);
	}

	// Inactive (no words in last 7 days)
	return (
		<p className="text-sm text-muted-foreground">
			<span className="hidden sm:inline">Let's add more words — {total} so far</span>
			<span className="sm:hidden">Let's add more words</span>
		</p>
	);
}
