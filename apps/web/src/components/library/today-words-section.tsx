"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { LibraryWordGrid } from "./library-word-grid";
import { client } from "@/utils/orpc";

export function TodayWordsSection() {
	const { data, isLoading } = useQuery({
		queryKey: ["library", "today"],
		queryFn: () => client.library.today(),
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!data?.words.length) {
		return null;
	}

	const formattedDate = new Date(data.date + "T00:00:00").toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return (
		<section className="mb-12">
			<div className="flex items-baseline gap-3 mb-4">
				<h2 className="text-lg font-medium">Today's Words</h2>
				<span className="text-sm text-muted-foreground">{formattedDate}</span>
			</div>
			<div className="border border-primary/20 bg-primary/5 p-4">
				<LibraryWordGrid words={data.words} />
			</div>
		</section>
	);
}
