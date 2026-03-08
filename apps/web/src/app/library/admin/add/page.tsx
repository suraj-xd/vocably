"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { client } from "@/utils/orpc";
import { authClient } from "@/lib/auth-client";

export default function LibraryAdminAddPage() {
	const { data: session, isPending: sessionLoading } = authClient.useSession();
	const [term, setTerm] = useState("");
	const [publishedAt, setPublishedAt] = useState(
		new Date().toISOString().split("T")[0]!,
	);
	const [isAdding, setIsAdding] = useState(false);
	const [recentlyAdded, setRecentlyAdded] = useState<string[]>([]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!term.trim() || isAdding) return;

		setIsAdding(true);
		try {
			await client.library.add({
				term: term.trim(),
				publishedAt,
				generateAI: true,
			});
			toast.success(`Added "${term.trim()}" to library`);
			setRecentlyAdded((prev) => [term.trim(), ...prev]);
			setTerm("");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to add word",
			);
		} finally {
			setIsAdding(false);
		}
	}

	if (sessionLoading) {
		return (
			<div className="flex items-center justify-center min-h-[50vh]">
				<Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!session?.user) {
		return (
			<div className="flex items-center justify-center min-h-[50vh]">
				<p className="text-muted-foreground text-sm">Not authenticated.</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-md px-4 py-16">
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Add to Library</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label
								htmlFor="term"
								className="text-xs text-muted-foreground block mb-1"
							>
								Word
							</label>
							<input
								id="term"
								type="text"
								value={term}
								onChange={(e) => setTerm(e.target.value)}
								placeholder="serendipity"
								autoFocus
								className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
							/>
						</div>
						<div>
							<label
								htmlFor="date"
								className="text-xs text-muted-foreground block mb-1"
							>
								Publish Date
							</label>
							<input
								id="date"
								type="date"
								value={publishedAt}
								onChange={(e) => setPublishedAt(e.target.value)}
								className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
							/>
						</div>
						<Button
							type="submit"
							disabled={!term.trim() || isAdding}
							className="w-full"
						>
							{isAdding ? (
								<Loader2 className="w-4 h-4 animate-spin mr-2" />
							) : (
								<Plus className="w-4 h-4 mr-2" />
							)}
							{isAdding ? "Adding..." : "Add Word"}
						</Button>
					</form>

					{recentlyAdded.length > 0 && (
						<div className="mt-6 pt-4 border-t">
							<p className="text-xs text-muted-foreground mb-2">
								Added this session
							</p>
							<div className="space-y-1">
								{recentlyAdded.map((w) => (
									<div
										key={w}
										className="flex items-center gap-2 text-sm text-muted-foreground"
									>
										<Check className="w-3 h-3 text-green-500" />
										{w}
									</div>
								))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
