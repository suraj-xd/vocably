"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, BookOpen } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { client } from "@/utils/orpc";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function WordOfDayBanner() {
	const router = useRouter();
	const pathname = usePathname();
	const { data: session } = authClient.useSession();
	const [isAdding, setIsAdding] = useState(false);

	const wordQuery = useQuery({
		queryKey: ["dailyWord", "today"],
		queryFn: () => client.dailyWord.today(),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Don't show on dashboard - it already has WordOfDayCard
	if (pathname?.startsWith("/dashboard")) {
		return null;
	}

	const handleAdd = async () => {
		if (!session) {
			router.push("/login");
			return;
		}

		setIsAdding(true);
		try {
			await client.dailyWord.addToday();
			toast.success(`Added "${wordQuery.data?.term}" to your vocabulary`);
			router.push("/dashboard");
		} catch (error) {
			if (error instanceof Error && error.message.includes("already exists")) {
				toast.info("You already have this word in your vocabulary");
			} else {
				toast.error("Failed to add word");
			}
		} finally {
			setIsAdding(false);
		}
	};

	if (!wordQuery.data) {
		return null;
	}

	return (
		<div className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-border bg-muted/30 text-sm">
			<BookOpen className="w-4 h-4 text-muted-foreground" />
			<span className="text-muted-foreground">Word of the Day:</span>
			<span className="font-medium">{wordQuery.data.term}</span>
			<button
				type="button"
				onClick={handleAdd}
				disabled={isAdding}
				className="ml-2 text-xs text-primary hover:underline underline-offset-2 disabled:opacity-50 transition-all flex items-center gap-1"
			>
				<Plus className="w-3 h-3" />
				Add to vocab
			</button>
		</div>
	);
}
