"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type CliState = "idle" | "typing" | "execute" | "output" | "complete" | "reset";

export function CliDemo() {
	const [state, setState] = useState<CliState>("idle");
	const [command, setCommand] = useState("");
	const [showOutput, setShowOutput] = useState(false);
	const [showCursor, setShowCursor] = useState(true);

	const fullCommand = "vocab add serendipity";

	// Animation loop
	useEffect(() => {
		let timeout: NodeJS.Timeout;

		switch (state) {
			case "idle":
				timeout = setTimeout(() => setState("typing"), 1000);
				break;
			case "typing":
				if (command.length < fullCommand.length) {
					timeout = setTimeout(() => {
						setCommand(fullCommand.slice(0, command.length + 1));
					}, 80);
				} else {
					timeout = setTimeout(() => setState("execute"), 300);
				}
				break;
			case "execute":
				setShowCursor(false);
				timeout = setTimeout(() => setState("output"), 200);
				break;
			case "output":
				setShowOutput(true);
				timeout = setTimeout(() => setState("complete"), 1500);
				break;
			case "complete":
				timeout = setTimeout(() => setState("reset"), 1000);
				break;
			case "reset":
				setCommand("");
				setShowOutput(false);
				setShowCursor(true);
				timeout = setTimeout(() => setState("idle"), 500);
				break;
		}

		return () => clearTimeout(timeout);
	}, [state, command]);

	return (
		<div className="relative w-full h-full bg-black p-6 font-mono text-sm overflow-hidden">
			{/* Terminal Header */}
			<div className="flex items-center gap-2 mb-4">
				<div className="w-3 h-3 rounded-full bg-red-500" />
				<div className="w-3 h-3 rounded-full bg-yellow-500" />
				<div className="w-3 h-3 rounded-full bg-green-500" />
			</div>

			{/* Terminal Content */}
			<div className="space-y-2 text-xs">
				{/* Command Line */}
				<div className="flex items-center gap-2">
					<span className="text-green-400">$</span>
					<span className="text-white">{command}</span>
					{showCursor && state === "typing" && (
						<motion.span
							animate={{ opacity: [1, 0] }}
							transition={{
								duration: 0.5,
								repeat: Number.POSITIVE_INFINITY,
								repeatType: "reverse",
							}}
							className="inline-block w-2 h-4 bg-green-400 ml-0.5"
						/>
					)}
				</div>

				{/* Output */}
				{showOutput && (
					<motion.div
						initial={{ opacity: 0, y: -5 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
						className="space-y-1 pl-0"
					>
						<div className="flex items-center gap-2 text-green-400">
							<svg
								className="w-3 h-3"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
							<span>Added "serendipity" to your vocabulary</span>
						</div>
						<div className="text-gray-400">
							AI generating definitions in background...
						</div>
					</motion.div>
				)}

				{/* New Prompt */}
				{showOutput && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5 }}
						className="flex items-center gap-2 pt-2"
					>
						<span className="text-green-400">$</span>
						<motion.span
							animate={{ opacity: [1, 0] }}
							transition={{
								duration: 0.5,
								repeat: Number.POSITIVE_INFINITY,
								repeatType: "reverse",
							}}
							className="inline-block w-2 h-4 bg-green-400"
						/>
					</motion.div>
				)}
			</div>
		</div>
	);
}
