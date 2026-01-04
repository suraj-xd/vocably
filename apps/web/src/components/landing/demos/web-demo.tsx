"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2 } from "lucide-react";

type AnimationState = "idle" | "hover" | "click" | "dialog" | "typing" | "submit" | "success" | "close";

export function WebDemo() {
	const [state, setState] = useState<AnimationState>("idle");
	const [typedText, setTypedText] = useState("");
	const [showToast, setShowToast] = useState(false);

	// Animation loop
	useEffect(() => {
		const word = "serendipity";
		let timeout: NodeJS.Timeout;

		switch (state) {
			case "idle":
				timeout = setTimeout(() => setState("hover"), 1500);
				break;
			case "hover":
				timeout = setTimeout(() => setState("click"), 500);
				break;
			case "click":
				timeout = setTimeout(() => setState("dialog"), 300);
				break;
			case "dialog":
				timeout = setTimeout(() => setState("typing"), 400);
				break;
			case "typing":
				if (typedText.length < word.length) {
					timeout = setTimeout(() => {
						setTypedText(word.slice(0, typedText.length + 1));
					}, 100);
				} else {
					timeout = setTimeout(() => setState("submit"), 500);
				}
				break;
			case "submit":
				setShowToast(true);
				timeout = setTimeout(() => setState("success"), 300);
				break;
			case "success":
				timeout = setTimeout(() => setState("close"), 1200);
				break;
			case "close":
				setShowToast(false);
				setTypedText("");
				timeout = setTimeout(() => setState("idle"), 500);
				break;
		}

		return () => clearTimeout(timeout);
	}, [state, typedText]);

	return (
		<div className="relative w-full h-full flex items-center justify-center bg-background p-6">
			{/* Mini Dashboard */}
			<div className="w-full max-w-[280px] space-y-4">
				{/* Header */}
				<div className="flex items-center justify-between pb-2 border-b border-border">
					<span className="font-mono text-xs">Dashboard</span>
				</div>

				{/* Add Word Button */}
				<motion.div
					animate={{
						scale: state === "hover" || state === "click" ? 0.98 : 1,
					}}
					transition={{ duration: 0.15 }}
				>
					<button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 border border-border transition-colors rounded-[6px]">
						<Plus className="w-4 h-4" />
						Add Word
					</button>
				</motion.div>

				{/* Animated Cursor */}
				<AnimatePresence>
					{(state === "hover" || state === "click") && (
						<motion.div
							initial={{ opacity: 0, x: -20, y: -20 }}
							animate={{ opacity: 1, x: 0, y: 0 }}
							exit={{ opacity: 0 }}
							className="absolute pointer-events-none"
							style={{
								left: "50%",
								top: "50%",
								transform: "translate(-50%, -20px)",
							}}
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="currentColor"
								className="text-foreground"
							>
								<path d="M7.4 2.5l-.7 14.2 4.9-4.9 3.1 6.1 2.7-1.4-3.1-6.1 6.2-.8L7.4 2.5z" />
							</svg>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Dialog */}
			<AnimatePresence>
				{(state === "dialog" || state === "typing" || state === "submit" || state === "success") && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="absolute inset-0 bg-black/50 z-10"
						/>

						{/* Dialog Content */}
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 10 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 10 }}
							transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
							className="absolute inset-0 flex items-center justify-center z-20 p-6"
						>
							<div className="bg-card border border-border w-full max-w-[300px] shadow-lg rounded-[6px] overflow-hidden">
								{/* Dialog Header */}
								<div className="p-4 border-b border-border">
									<h3 className="text-sm font-semibold">Add New Word</h3>
									<p className="text-xs text-muted-foreground mt-1">
										Add a word to your vocabulary
									</p>
								</div>

								{/* Dialog Body */}
								<div className="p-4 space-y-3">
									<div className="space-y-1.5">
										<label className="text-xs font-medium">Word *</label>
										<div className="relative">
											<input
												type="text"
												className="w-full px-3 py-1.5 text-sm bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary rounded-[6px]"
												value={typedText}
												readOnly
												placeholder="serendipity"
											/>
											{state === "typing" && (
												<motion.div
													animate={{ opacity: [1, 0] }}
													transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}
													className="absolute right-3 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary"
												/>
											)}
										</div>
									</div>
								</div>

								{/* Dialog Footer */}
								<div className="p-4 border-t border-border flex justify-end gap-2">
									<button className="px-3 py-1.5 text-xs font-medium border border-border hover:bg-accent transition-colors rounded-[6px]">
										Cancel
									</button>
									<motion.button
										animate={{
											opacity: state === "submit" ? 0.7 : 1,
										}}
										className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground inline-flex items-center gap-1.5 rounded-[6px]"
									>
										{state === "submit" && <Loader2 className="w-3 h-3 animate-spin" />}
										Add Word
									</motion.button>
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			{/* Toast Notification */}
			<AnimatePresence>
				{showToast && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30"
					>
						<div className="bg-green-50 border border-green-200 text-green-900 px-3 py-1.5 text-[10px] font-medium shadow-sm flex items-center gap-1.5 rounded-[6px]">
							<svg
								className="w-3 h-3 text-green-600"
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
							<span>Added "serendipity"</span>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
