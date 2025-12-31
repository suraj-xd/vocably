"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Sparkles, Plus, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SpeakButton } from "@/components/speak-button";
import { client } from "@/utils/orpc";

export function WordOfDayCard({ onWordAdded }: { onWordAdded?: () => void }) {
	const queryClient = useQueryClient();

	const { data: status, isLoading } = useQuery({
		queryKey: ["dailyWord", "status"],
		queryFn: () => client.dailyWord.status(),
	});

	const addMutation = useMutation({
		mutationFn: () => client.dailyWord.addToday(),
		onSuccess: (result) => {
			if (result.skipped) {
				toast.info(`You already have "${result.term}" in your vocabulary`);
			} else {
				toast.success(`"${result.term}" added to your vocabulary!`);
				onWordAdded?.();
			}
			queryClient.invalidateQueries({ queryKey: ["dailyWord", "status"] });
			queryClient.invalidateQueries({ queryKey: ["words"] });
		},
		onError: () => {
			toast.error("Failed to add word of the day");
		},
	});

	if (isLoading) {
		return (
			<Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
				<CardContent className="py-6">
					<div className="flex items-center justify-center">
						<Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!status) return null;

	const formattedDate = new Date(status.date + "T00:00:00").toLocaleDateString(
		"en-US",
		{
			weekday: "long",
			month: "long",
			day: "numeric",
		},
	);

	return (
		<Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<CardTitle className="text-sm font-medium flex items-center gap-2">
						Word of the Day
					</CardTitle>
					<div className="flex items-center gap-1 text-xs text-muted-foreground">
						<Calendar className="w-3 h-3" />
						{formattedDate}
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="flex items-center justify-between">
					<div>
						<div className="flex items-center gap-2">
							<h3 className="text-2xl font-bold tracking-tight capitalize">
								{status.term}
							</h3>
							<SpeakButton text={status.term} size="md" />
						</div>
						{status.hasReceived && status.word?.meaning && (
							<p className="text-sm text-muted-foreground mt-1 line-clamp-2">
								{status.word.meaning}
							</p>
						)}
					</div>

					{status.hasReceived ? (
						<Badge variant="secondary" className="gap-1">
							<Check className="w-3 h-3" />
							{status.wasSkipped ? "Already Known" : "Added"}
						</Badge>
					) : (
						<Button
							size="sm"
							onClick={() => addMutation.mutate()}
							disabled={addMutation.isPending}
						>
							{addMutation.isPending ? (
								<Loader2 className="w-4 h-4 animate-spin" />
							) : (
								<>
									<Plus className="w-4 h-4 mr-1" />
									Add to Vocab
								</>
							)}
						</Button>
					)}
				</div>

				{status.hasReceived && status.word && (
					<div className="flex flex-wrap gap-2 pt-1">
						{status.word.partOfSpeech && (
							<Badge variant="outline" className="text-xs">
								{status.word.partOfSpeech}
							</Badge>
						)}
						{status.word.difficulty && (
							<Badge variant="outline" className="text-xs">
								{status.word.difficulty}
							</Badge>
						)}
						{status.word.source === "word_of_day" && (
							<Badge variant="outline" className="text-xs text-primary">
								Daily Word
							</Badge>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
