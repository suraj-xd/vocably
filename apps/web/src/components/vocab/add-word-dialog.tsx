"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { client } from "@/utils/orpc";

interface WordData {
	id: string;
	term: string;
	notes?: string | null;
	context?: string | null;
}

interface AddWordDialogProps {
	onSuccess?: () => void;
	// Edit mode props
	editWord?: WordData;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	// Pre-fill term (for paste-to-add feature)
	initialTerm?: string;
}

export function AddWordDialog({
	onSuccess,
	editWord,
	open: controlledOpen,
	onOpenChange,
	initialTerm,
}: AddWordDialogProps) {
	const isEditMode = !!editWord;
	const isControlled = controlledOpen !== undefined;

	const [internalOpen, setInternalOpen] = useState(false);
	const open = isControlled ? controlledOpen : internalOpen;
	const setOpen = isControlled ? onOpenChange! : setInternalOpen;

	const [term, setTerm] = useState("");
	const [notes, setNotes] = useState("");
	const [context, setContext] = useState("");
	const [generateAI, setGenerateAI] = useState(true);
	const [regenerateAI, setRegenerateAI] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [originalTerm, setOriginalTerm] = useState("");

	const queryClient = useQueryClient();

	// Check if term has been edited (only relevant in edit mode)
	const termHasChanged = isEditMode && term.toLowerCase().trim() !== originalTerm.toLowerCase().trim();

	// Populate form when editing
	useEffect(() => {
		if (editWord && open) {
			setTerm(editWord.term);
			setOriginalTerm(editWord.term);
			setNotes(editWord.notes ?? "");
			setContext(editWord.context ?? "");
			setRegenerateAI(false);
		}
	}, [editWord, open]);

	// Auto-check regenerateAI when term changes
	useEffect(() => {
		if (termHasChanged) {
			setRegenerateAI(true);
		}
	}, [termHasChanged]);

	// Reset form when dialog closes
	useEffect(() => {
		if (!open) {
			if (!isEditMode) {
				setTerm("");
				setNotes("");
				setContext("");
				setGenerateAI(true);
			}
			setRegenerateAI(false);
		}
	}, [open, isEditMode]);

	// Pre-fill term from initialTerm (paste-to-add feature)
	useEffect(() => {
		if (initialTerm && open && !isEditMode) {
			setTerm(initialTerm);
		}
	}, [initialTerm, open, isEditMode]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		if (!term.trim()) {
			toast.error("Please enter a word");
			return;
		}

		setIsLoading(true);

		try {
			if (isEditMode && editWord) {
				// Update existing word
				const clearAI = termHasChanged && !regenerateAI;

				const result = await client.words.update({
					id: editWord.id,
					term: termHasChanged ? term.trim() : undefined,
					notes: notes.trim() || undefined,
					context: context.trim() || undefined,
					regenerateAI,
					clearAI,
				});

				if (result.aiPending) {
					toast.success(`Updated "${term}" - AI generating in background`);
				} else if (clearAI) {
					toast.success(`Updated "${term}" - AI data cleared`);
				} else {
					toast.success(`Updated "${term}"`);
				}
			} else {
				// Add new word
				const result = await client.words.add({
					term: term.trim(),
					notes: notes.trim() || undefined,
					context: context.trim() || undefined,
					generateAI,
				});

				if (result.aiPending) {
					toast.success(`Added "${term}" - AI generating in background`);
				} else {
					toast.success(`Added "${term}" to your vocabulary`);
				}
			}

			// Reset form
			setTerm("");
			setNotes("");
			setContext("");
			setGenerateAI(true);
			setRegenerateAI(false);
			setOpen(false);

			// Invalidate queries to refresh the list
			queryClient.invalidateQueries({ queryKey: ["words"] });

			onSuccess?.();
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: `Failed to ${isEditMode ? "update" : "add"} word`,
			);
		} finally {
			setIsLoading(false);
		}
	}

	const dialogContent = (
		<DialogContent className="sm:max-w-[425px]">
			<form onSubmit={handleSubmit}>
				<DialogHeader>
					<DialogTitle>{isEditMode ? "Update Word" : "Add New Word"}</DialogTitle>
					<DialogDescription>
						{isEditMode
							? "Update the word details. You can also regenerate AI content."
							: "Add a word to your vocabulary. AI will generate definitions and examples."}
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="term">Word *</Label>
						<Input
							id="term"
							placeholder="serendipity"
							value={term}
							onChange={(e) => setTerm(e.target.value)}
							autoFocus={!isEditMode}
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="notes">Personal Notes</Label>
						<Input
							id="notes"
							placeholder="Heard this in a podcast..."
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							autoFocus={isEditMode}
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="context">Where did you find it?</Label>
						<Input
							id="context"
							placeholder="TED Talk, Book: Atomic Habits..."
							value={context}
							onChange={(e) => setContext(e.target.value)}
						/>
					</div>
					<div className="flex items-center space-x-2">
						{isEditMode ? (
							<>
								<Checkbox
									id="regenerateAI"
									checked={regenerateAI}
									onCheckedChange={(checked) => setRegenerateAI(checked === true)}
								/>
								<Label htmlFor="regenerateAI" className="text-sm cursor-pointer">
									Regenerate AI definitions and examples
								</Label>
							</>
						) : (
							<>
								<Checkbox
									id="generateAI"
									checked={generateAI}
									onCheckedChange={(checked) => setGenerateAI(checked === true)}
								/>
								<Label htmlFor="generateAI" className="text-sm cursor-pointer">
									Generate AI definitions and examples
								</Label>
							</>
						)}
					</div>
				</div>
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => setOpen(false)}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isLoading}>
						{isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
						{isEditMode ? "Update Word" : "Add Word"}
					</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	);

	// For controlled mode (edit), don't render a trigger
	if (isControlled) {
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				{dialogContent}
			</Dialog>
		);
	}

	// For uncontrolled mode (add), render with trigger button
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="w-4 h-4 mr-2" />
					Add Word
				</Button>
			</DialogTrigger>
			{dialogContent}
		</Dialog>
	);
}
