"use client";

import { X } from "lucide-react";
import { format } from "date-fns";
import type { DateFilterState } from "./date-filter";

interface ActiveFilterChipProps {
	dateFilter: DateFilterState;
	onClear: () => void;
}

export function ActiveFilterChip({
	dateFilter,
	onClear,
}: ActiveFilterChipProps) {
	if (dateFilter.preset === "all") {
		return null;
	}

	const getLabel = () => {
		switch (dateFilter.preset) {
			case "7d":
				return "Last 7 days";
			case "30d":
				return "Last 30 days";
			case "3m":
				return "Last 3 months";
			case "custom":
				if (dateFilter.customStart && dateFilter.customEnd) {
					return `${format(dateFilter.customStart, "MMM d")} - ${format(dateFilter.customEnd, "MMM d")}`;
				}
				return "Custom range";
		}
	};

	return (
		<div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-muted border border-border">
			<span>{getLabel()}</span>
			<button
				type="button"
				onClick={onClear}
				className="hover:bg-muted-foreground/20 rounded-none p-0.5 transition-colors"
			>
				<X className="w-3 h-3" />
			</button>
		</div>
	);
}
