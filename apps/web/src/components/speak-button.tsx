"use client";

import { Volume2 } from "lucide-react";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { cn } from "@/lib/utils";

interface SpeakButtonProps {
	text: string;
	lang?: string;
	size?: "sm" | "md" | "lg";
	className?: string;
}

const sizeClasses = {
	sm: "w-4 h-4",
	md: "w-5 h-5",
	lg: "w-6 h-6",
};

export function SpeakButton({
	text,
	lang = "en-US",
	size = "md",
	className,
}: SpeakButtonProps) {
	const { speak, isSpeaking, isSupported } = useSpeechSynthesis();

	if (!isSupported) return null;

	return (
		<button
			type="button"
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				speak(text, lang);
			}}
			disabled={isSpeaking}
			className={cn(
				"text-muted-foreground transition-colors",
				isSpeaking
					? "opacity-50 cursor-not-allowed animate-pulse"
					: "hover:text-foreground cursor-pointer",
				className,
			)}
			title={isSpeaking ? "Speaking..." : "Listen to pronunciation"}
		>
			<Volume2 className={sizeClasses[size]} />
		</button>
	);
}

