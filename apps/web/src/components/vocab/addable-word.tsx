"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { AddWordDialog } from "./add-word-dialog";

interface AddableWordProps {
	word: string;
	className?: string;
}

export function AddableWord({ word, className = "" }: AddableWordProps) {
	const [isHovered, setIsHovered] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const queryClient = useQueryClient();

	const handleSuccess = () => {
		queryClient.invalidateQueries({ queryKey: ["words"] });
	};

	return (
		<>
			<span
				className={`relative inline-flex items-center justify-center px-2 py-1 bg-secondary text-sm cursor-pointer transition-all ${className}`}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				onClick={() => setDialogOpen(true)}
			>
				<span
					className={`transition-all duration-150 ${
						isHovered ? "blur-[2px] opacity-50" : ""
					}`}
				>
					{word}
				</span>
				{isHovered && (
					<span className="absolute inset-0 flex items-center justify-center">
						<Plus className="w-4 h-4" />
					</span>
				)}
			</span>

			<AddWordDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				onSuccess={handleSuccess}
				initialTerm={word}
			/>
		</>
	);
}
