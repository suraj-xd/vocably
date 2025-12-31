"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export function useSpeechSynthesis() {
	const [isSpeaking, setIsSpeaking] = useState(false);
	const [isSupported, setIsSupported] = useState(false);
	const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

	useEffect(() => {
		setIsSupported(typeof window !== "undefined" && "speechSynthesis" in window);
	}, []);

	const speak = useCallback(
		(text: string, lang = "en-US") => {
			if (!isSupported || isSpeaking) return;

			window.speechSynthesis.cancel();

			const utterance = new SpeechSynthesisUtterance(text);
			utterance.lang = lang;
			utterance.rate = 0.9;
			utterance.pitch = 1;

			utterance.onstart = () => setIsSpeaking(true);
			utterance.onend = () => setIsSpeaking(false);
			utterance.onerror = () => setIsSpeaking(false);

			utteranceRef.current = utterance;
			window.speechSynthesis.speak(utterance);
		},
		[isSupported, isSpeaking],
	);

	const stop = useCallback(() => {
		if (isSupported) {
			window.speechSynthesis.cancel();
			setIsSpeaking(false);
		}
	}, [isSupported]);

	useEffect(() => {
		return () => {
			if (isSupported) {
				window.speechSynthesis.cancel();
			}
		};
	}, [isSupported]);

	return { speak, stop, isSpeaking, isSupported };
}

