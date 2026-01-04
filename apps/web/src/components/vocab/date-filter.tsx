"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";

export type DateFilterValue =
	| "all"
	| "7d"
	| "30d"
	| "3m"
	| "custom";

export interface DateFilterState {
	preset: DateFilterValue;
	customStart?: Date;
	customEnd?: Date;
}

interface DateFilterProps {
	value: DateFilterState;
	onChange: (value: DateFilterState) => void;
}

export function DateFilter({ value, onChange }: DateFilterProps) {
	const [open, setOpen] = useState(false);
	const [tempCustomStart, setTempCustomStart] = useState<Date | undefined>(
		value.customStart,
	);
	const [tempCustomEnd, setTempCustomEnd] = useState<Date | undefined>(
		value.customEnd,
	);

	const getLabel = () => {
		switch (value.preset) {
			case "all":
				return "All time";
			case "7d":
				return "Last 7 days";
			case "30d":
				return "Last 30 days";
			case "3m":
				return "Last 3 months";
			case "custom":
				if (value.customStart && value.customEnd) {
					return `${format(value.customStart, "MMM d")} - ${format(value.customEnd, "MMM d")}`;
				}
				return "Custom range";
		}
	};

	const handlePresetChange = (preset: DateFilterValue) => {
		if (preset === "custom") {
			onChange({
				preset,
				customStart: tempCustomStart,
				customEnd: tempCustomEnd,
			});
		} else {
			onChange({ preset });
		}
	};

	const handleApplyCustom = () => {
		if (tempCustomStart && tempCustomEnd) {
			onChange({
				preset: "custom",
				customStart: tempCustomStart,
				customEnd: tempCustomEnd,
			});
			setOpen(false);
		}
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
				<CalendarIcon className="w-4 h-4" />
				{getLabel()}
			</PopoverTrigger>
			<PopoverContent className="w-auto p-4" align="end">
				<div className="space-y-4">
					<RadioGroup
						value={value.preset}
						onValueChange={(val) => handlePresetChange(val as DateFilterValue)}
					>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="all" id="all" />
							<Label htmlFor="all" className="cursor-pointer">
								All time
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="7d" id="7d" />
							<Label htmlFor="7d" className="cursor-pointer">
								Last 7 days
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="30d" id="30d" />
							<Label htmlFor="30d" className="cursor-pointer">
								Last 30 days
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="3m" id="3m" />
							<Label htmlFor="3m" className="cursor-pointer">
								Last 3 months
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="custom" id="custom" />
							<Label htmlFor="custom" className="cursor-pointer">
								Custom range
							</Label>
						</div>
					</RadioGroup>

					{value.preset === "custom" && (
						<div className="space-y-4 pt-4 border-t">
							<div className="space-y-2">
								<Label className="text-sm">Start Date</Label>
								<Calendar
									mode="single"
									selected={tempCustomStart}
									onSelect={setTempCustomStart}
									initialFocus
								/>
							</div>
							<div className="space-y-2">
								<Label className="text-sm">End Date</Label>
								<Calendar
									mode="single"
									selected={tempCustomEnd}
									onSelect={setTempCustomEnd}
									disabled={(date) =>
										tempCustomStart ? date < tempCustomStart : false
									}
								/>
							</div>
							<Button
								onClick={handleApplyCustom}
								className="w-full"
								disabled={!tempCustomStart || !tempCustomEnd}
							>
								Apply
							</Button>
						</div>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
