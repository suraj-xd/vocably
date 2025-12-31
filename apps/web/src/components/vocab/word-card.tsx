"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { MoreVertical, Pencil, Trash2, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SpeakButton } from "@/components/speak-button";
import { AddWordDialog } from "@/components/vocab/add-word-dialog";
import { client } from "@/utils/orpc";

interface WordCardProps {
	word: {
		id: string;
		term: string;
		meaning?: string | null;
		notes?: string | null;
		context?: string | null;
		category?: { name: string } | null;
		difficulty?: string | null;
		aiStatus?: string | null;
		aiError?: string | null;
		createdAt: Date;
	};
	onUpdate?: () => void;
}

export function WordCard({ word, onUpdate }: WordCardProps) {
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const queryClient = useQueryClient();

	async function handleDelete() {
		if (isDeleting) return;

		setIsDeleting(true);

		try {
			await client.words.remove({ term: word.term });
			toast.success(`Removed "${word.term}" from your vocabulary`);
			queryClient.invalidateQueries({ queryKey: ["words"] });
			setDeleteDialogOpen(false);
			onUpdate?.();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete word",
			);
		} finally {
			setIsDeleting(false);
		}
	}

	function handleEditClick(e: React.MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		setEditDialogOpen(true);
	}

	function handleDeleteClick(e: React.MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		setDeleteDialogOpen(true);
	}

	return (
		<>
			<Link href={`/dashboard/words/${word.id}`}>
				<Card className="h-full hover:border-foreground/20 transition-colors cursor-pointer group relative">
					<CardHeader className="pb-2">
						<div className="flex items-start justify-between">
							<div className="flex items-center gap-2">
								<h3 className="text-lg font-semibold group-hover:underline underline-offset-2">
									{word.term}
								</h3>
								<SpeakButton text={word.term} size="sm" />
							</div>
							<div className="flex items-center gap-1">
								{word.difficulty && (
									<span
										className={`text-xs px-2 py-0.5 ${
											word.difficulty === "beginner"
												? "bg-green-500/10 text-green-500"
												: word.difficulty === "intermediate"
													? "bg-yellow-500/10 text-yellow-500"
													: "bg-red-500/10 text-red-500"
										}`}
									>
										{word.difficulty}
									</span>
								)}
								<DropdownMenu>
									<DropdownMenuTrigger
										className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
										onClick={(e) => e.preventDefault()}
									>
										<MoreVertical className="h-4 w-4" />
										<span className="sr-only">Open menu</span>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem onClick={handleEditClick}>
											<Pencil className="h-4 w-4 mr-2" />
											Edit
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={handleDeleteClick}
											className="text-destructive focus:text-destructive"
										>
											<Trash2 className="h-4 w-4 mr-2" />
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>
						{word.category && (
							<span className="text-xs text-muted-foreground">
								{word.category.name}
							</span>
						)}
					</CardHeader>
					<CardContent>
						{word.aiStatus === "pending" || word.aiStatus === "generating" ? (
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Loader2 className="h-4 w-4 animate-spin" />
								<span>Generating definition...</span>
							</div>
						) : word.aiStatus === "error" ? (
							<div className="flex items-start gap-2 text-sm text-destructive">
								<AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
								<span className="line-clamp-2">{word.aiError || "AI generation failed"}</span>
							</div>
						) : word.meaning ? (
							<p className="text-sm text-muted-foreground line-clamp-3">
								{word.meaning}
							</p>
						) : (
							<p className="text-sm text-muted-foreground/50 italic">
								No definition yet
							</p>
						)}
					</CardContent>
				</Card>
			</Link>

			{/* Edit Dialog */}
			<AddWordDialog
				editWord={{
					id: word.id,
					term: word.term,
					notes: word.notes,
					context: word.context,
				}}
				open={editDialogOpen}
				onOpenChange={setEditDialogOpen}
				onSuccess={onUpdate}
			/>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete "{word.term}"?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently remove this word from your vocabulary. This
							action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
