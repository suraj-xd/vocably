"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface PageSizeSelectProps {
	value: number;
	onChange: (value: number) => void;
}

export function PageSizeSelect({ value, onChange }: PageSizeSelectProps) {
	return (
		<div className="flex items-center gap-2">
			<span className="text-sm text-muted-foreground">Show:</span>
			<Select
				value={value.toString()}
				onValueChange={(val) => val && onChange(Number.parseInt(val))}
			>
				<SelectTrigger className="w-20">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="25">25</SelectItem>
					<SelectItem value="50">50</SelectItem>
					<SelectItem value="100">100</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
