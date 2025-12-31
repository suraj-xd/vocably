"use client";

import { useEffect, useState } from "react";

const VOCAB_ASCII = `
██╗   ██╗ ██████╗  ██████╗ █████╗ ██████╗
██║   ██║██╔═══██╗██╔════╝██╔══██╗██╔══██╗
██║   ██║██║   ██║██║     ███████║██████╔╝
╚██╗ ██╔╝██║   ██║██║     ██╔══██║██╔══██╗
 ╚████╔╝ ╚██████╔╝╚██████╗██║  ██║██████╔╝
  ╚═══╝   ╚═════╝  ╚═════╝╚═╝  ╚═╝╚═════╝
`.trim();

const GLITCH_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

export function AsciiHero() {
	const [displayText, setDisplayText] = useState("");
	const [isTyping, setIsTyping] = useState(true);
	const [glitchIndices, setGlitchIndices] = useState<Set<number>>(new Set());

	// Typing effect
	useEffect(() => {
		if (!isTyping) return;

		let currentIndex = 0;
		const chars = VOCAB_ASCII.split("");

		const typeInterval = setInterval(() => {
			if (currentIndex < chars.length) {
				setDisplayText(VOCAB_ASCII.slice(0, currentIndex + 1));
				currentIndex++;
			} else {
				setIsTyping(false);
				clearInterval(typeInterval);
			}
		}, 2);

		return () => clearInterval(typeInterval);
	}, [isTyping]);

	// Subtle glitch effect after typing completes
	useEffect(() => {
		if (isTyping) return;

		const glitchInterval = setInterval(() => {
			// Randomly glitch 1-3 characters
			const newGlitchIndices = new Set<number>();
			const numGlitches = Math.floor(Math.random() * 3) + 1;

			for (let i = 0; i < numGlitches; i++) {
				const idx = Math.floor(Math.random() * VOCAB_ASCII.length);
				if (VOCAB_ASCII[idx] !== " " && VOCAB_ASCII[idx] !== "\n") {
					newGlitchIndices.add(idx);
				}
			}

			setGlitchIndices(newGlitchIndices);

			// Clear glitch after short duration
			setTimeout(() => {
				setGlitchIndices(new Set());
			}, 50);
		}, 3000);

		return () => clearInterval(glitchInterval);
	}, [isTyping]);

	const renderText = () => {
		if (isTyping) {
			return displayText;
		}

		return VOCAB_ASCII.split("").map((char, idx) => {
			if (glitchIndices.has(idx)) {
				const glitchChar =
					GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
				return (
					<span key={idx} className="text-muted-foreground">
						{glitchChar}
					</span>
				);
			}
			return <span key={idx}>{char}</span>;
		});
	};

	return (
		<div className="relative">
			<pre
				className="text-[0.4rem] sm:text-[0.5rem] md:text-xs lg:text-sm leading-tight select-none"
				aria-label="VOCAB"
			>
				{renderText()}
				{isTyping && <span className="animate-pulse">_</span>}
			</pre>
		</div>
	);
}
