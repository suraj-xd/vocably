"use client";

import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
	currentStep: number;
	totalSteps: number;
}

export function ProgressIndicator({
	currentStep,
	totalSteps,
}: ProgressIndicatorProps) {
	return (
		<div className="flex items-center justify-center gap-2">
			{Array.from({ length: totalSteps }, (_, i) => (
				<span
					key={i}
					className={cn(
						"h-1.5 transition-all duration-300",
						i === currentStep
							? "w-6 bg-primary"
							: i < currentStep
								? "w-1.5 bg-primary/60"
								: "w-1.5 bg-muted-foreground/30",
					)}
				/>
			))}
		</div>
	);
}
