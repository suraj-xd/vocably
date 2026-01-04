import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonCardsProps {
	count?: number;
}

export function SkeletonCards({ count = 6 }: SkeletonCardsProps) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			{Array.from({ length: count }).map((_, i) => (
				<div
					key={i}
					className="border border-border bg-card p-6 space-y-4"
				>
					<div className="flex items-start justify-between">
						<Skeleton className="h-7 w-32" />
						<Skeleton className="h-5 w-5" />
					</div>
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-3/4" />
					<div className="flex items-center gap-2 pt-2">
						<Skeleton className="h-5 w-16" />
						<Skeleton className="h-5 w-20" />
					</div>
				</div>
			))}
		</div>
	);
}
