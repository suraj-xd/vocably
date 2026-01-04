"use client";

import { MoreVertical } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import type { DateFilterState } from "./date-filter";
import { useState } from "react";

interface FilterMenuProps {
	pageSize: number;
	onPageSizeChange: (size: number) => void;
	dateFilter: DateFilterState;
	onDateFilterChange: (filter: DateFilterState) => void;
}

export function FilterMenu({
	pageSize,
	onPageSizeChange,
	dateFilter,
	onDateFilterChange,
}: FilterMenuProps) {
	// Handle both Date objects and ISO strings from localStorage
	const [tempCustomStart, setTempCustomStart] = useState<Date | undefined>(() => {
		const start = dateFilter.customStart;
		if (!start) return undefined;
		return start instanceof Date ? start : new Date(start);
	});
	const [tempCustomEnd, setTempCustomEnd] = useState<Date | undefined>(() => {
		const end = dateFilter.customEnd;
		if (!end) return undefined;
		return end instanceof Date ? end : new Date(end);
	});

	const handlePresetChange = (preset: DateFilterState["preset"]) => {
		if (preset === "custom") {
			onDateFilterChange({
				preset,
				customStart: tempCustomStart,
				customEnd: tempCustomEnd,
			});
		} else {
			onDateFilterChange({ preset });
		}
	};

	const handleApplyCustom = () => {
		if (tempCustomStart && tempCustomEnd) {
			onDateFilterChange({
				preset: "custom",
				customStart: tempCustomStart,
				customEnd: tempCustomEnd,
			});
		}
	};

	const handleClearFilters = () => {
		onDateFilterChange({ preset: "all" });
	};

	const hasActiveFilters = dateFilter.preset !== "all";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 w-9 p-0">
				<MoreVertical className="w-4 h-4" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-80">
				<DropdownMenuGroup>
					<DropdownMenuLabel className="text-xs">Filters & Settings</DropdownMenuLabel>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />

				{/* Page Size */}
				<div className="px-2 py-3 space-y-2">
					<Label className="text-xs text-muted-foreground">Items per page</Label>
					<Select
						value={pageSize.toString()}
						onValueChange={(val) => val && onPageSizeChange(Number.parseInt(val))}
					>
						<SelectTrigger className="w-full h-8">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="25">25</SelectItem>
							<SelectItem value="50">50</SelectItem>
							<SelectItem value="100">100</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<DropdownMenuSeparator />

				{/* Date Range */}
				<div className="px-2 py-3 space-y-3">
					<Label className="text-xs text-muted-foreground">Date range</Label>
					<RadioGroup
						value={dateFilter.preset}
						onValueChange={(val) =>
							handlePresetChange(val as DateFilterState["preset"])
						}
						className="space-y-2"
					>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="all" id="filter-all" />
							<Label htmlFor="filter-all" className="text-sm cursor-pointer font-normal">
								All time
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="7d" id="filter-7d" />
							<Label htmlFor="filter-7d" className="text-sm cursor-pointer font-normal">
								Last 7 days
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="30d" id="filter-30d" />
							<Label htmlFor="filter-30d" className="text-sm cursor-pointer font-normal">
								Last 30 days
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="3m" id="filter-3m" />
							<Label htmlFor="filter-3m" className="text-sm cursor-pointer font-normal">
								Last 3 months
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="custom" id="filter-custom" />
							<Label htmlFor="filter-custom" className="text-sm cursor-pointer font-normal">
								Custom range
							</Label>
						</div>
					</RadioGroup>

					{/* Custom Date Pickers */}
					{dateFilter.preset === "custom" && (
						<div className="space-y-3 pt-3 border-t">
							<div className="space-y-2">
								<Label className="text-xs">Start Date</Label>
								<Calendar
									mode="single"
									selected={tempCustomStart}
									onSelect={setTempCustomStart}
									className="rounded-none border"
								/>
							</div>
							<div className="space-y-2">
								<Label className="text-xs">End Date</Label>
								<Calendar
									mode="single"
									selected={tempCustomEnd}
									onSelect={setTempCustomEnd}
									disabled={(date) =>
										tempCustomStart ? date < tempCustomStart : false
									}
									className="rounded-none border"
								/>
							</div>
							<button
								type="button"
								onClick={handleApplyCustom}
								disabled={!tempCustomStart || !tempCustomEnd}
								className="w-full px-3 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
							>
								Apply
							</button>
						</div>
					)}
				</div>

				{/* Clear Filters */}
				{hasActiveFilters && (
					<>
						<DropdownMenuSeparator />
						<div className="px-2 py-2">
							<button
								type="button"
								onClick={handleClearFilters}
								className="text-sm text-destructive hover:underline underline-offset-2 transition-all"
							>
								Clear filters
							</button>
						</div>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
