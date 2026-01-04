"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type AiState = "idle" | "userMessage" | "thinking" | "toolCall" | "aiResponse" | "complete" | "reset";

export function AiDemo() {
	const [state, setState] = useState<AiState>("idle");

	// Animation loop with stagger (start at 2s to offset from other demos)
	useEffect(() => {
		let timeout: NodeJS.Timeout;

		switch (state) {
			case "idle":
				timeout = setTimeout(() => setState("userMessage"), 2000);
				break;
			case "userMessage":
				timeout = setTimeout(() => setState("thinking"), 800);
				break;
			case "thinking":
				timeout = setTimeout(() => setState("toolCall"), 1000);
				break;
			case "toolCall":
				timeout = setTimeout(() => setState("aiResponse"), 1200);
				break;
			case "aiResponse":
				timeout = setTimeout(() => setState("complete"), 1000);
				break;
			case "complete":
				timeout = setTimeout(() => setState("reset"), 800);
				break;
			case "reset":
				timeout = setTimeout(() => setState("idle"), 500);
				break;
		}

		return () => clearTimeout(timeout);
	}, [state]);

	const showUserMessage = ["userMessage", "thinking", "toolCall", "aiResponse", "complete"].includes(state);
	const showThinking = state === "thinking";
	const showToolCall = ["toolCall", "aiResponse", "complete"].includes(state);
	const showAiResponse = ["aiResponse", "complete"].includes(state);

	return (
		<div className="relative w-full h-full bg-white p-4 overflow-hidden">
			{/* Messages */}
			<div className="space-y-4 pt-2">
				{/* User Message */}
				<AnimatePresence>
					{showUserMessage && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
							className="flex justify-end"
						>
							<div className="bg-blue-500 text-white px-4 py-2.5 rounded-[6px] text-xs leading-relaxed max-w-[85%]">
								Can you add 'ephemeral' to my vocabulary?
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* AI Thinking */}
				<AnimatePresence>
					{showThinking && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0 }}
							className="flex items-start gap-2"
						>
							<div className="w-6 h-6 rounded-full bg-[#10a37f] flex items-center justify-center flex-shrink-0 mt-0.5">
								<Image
									src="https://models.dev/logos/openai.svg"
									alt="OpenAI"
									width={14}
									height={14}
									className="invert"
									unoptimized
								/>
							</div>
							<div className="bg-gray-100 px-4 py-2.5 rounded-[6px] text-xs text-gray-500 flex items-center gap-1.5">
								<motion.div
									animate={{ scale: [1, 1.2, 1] }}
									transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY }}
									className="w-1 h-1 rounded-full bg-gray-400"
								/>
								<motion.div
									animate={{ scale: [1, 1.2, 1] }}
									transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
									className="w-1 h-1 rounded-full bg-gray-400"
								/>
								<motion.div
									animate={{ scale: [1, 1.2, 1] }}
									transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
									className="w-1 h-1 rounded-full bg-gray-400"
								/>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* AI Response with Tool Call */}
				<AnimatePresence>
					{showToolCall && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							className="flex items-start gap-2"
						>
							<div className="w-6 h-6 rounded-full bg-[#10a37f] flex items-center justify-center flex-shrink-0 mt-0.5">
								<Image
									src="https://models.dev/logos/openai.svg"
									alt="OpenAI"
									width={14}
									height={14}
									className="invert"
									unoptimized
								/>
							</div>
							<div className="space-y-2 max-w-[85%]">
								{/* Tool Call Card */}
								<motion.div
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: 0.2 }}
									className="bg-gray-50 border border-gray-200 rounded-[6px] px-3 py-2"
								>
									<div className="flex items-center gap-1.5 mb-1.5">
										<svg
											className="w-3 h-3 text-gray-600"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
											/>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
											/>
										</svg>
										<span className="text-xs font-mono text-gray-700 font-medium">
											add-word
										</span>
									</div>
									<div className="font-mono text-[10px] text-gray-600 space-y-0.5">
										<div>
											<span className="text-gray-500">term:</span> "ephemeral"
										</div>
									</div>
								</motion.div>

								{/* AI Success Message */}
								{showAiResponse && (
									<motion.div
										initial={{ opacity: 0, y: 5 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.3 }}
										className="bg-gray-100 px-4 py-2.5 rounded-[6px] text-xs text-gray-900 leading-relaxed"
									>
										I've added 'ephemeral' to your vocabulary!
									</motion.div>
								)}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
