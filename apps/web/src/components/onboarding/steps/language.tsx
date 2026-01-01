"use client";

import { useState, useMemo } from "react";
import { Check, Search, Globe } from "lucide-react";
import * as Flags from "country-flag-icons/react/3x2";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LANGUAGES, type Language } from "@/components/language-selector";

function FlagIcon({
	countryCode,
	className,
}: { countryCode: string; className?: string }) {
	const FlagComponent = Flags[countryCode as keyof typeof Flags];
	if (!FlagComponent) return <Globe className={cn("w-5 h-4", className)} />;
	return <FlagComponent className={cn("w-5 h-auto", className)} />;
}

interface LanguageStepProps {
	value: string;
	onChange: (code: string) => void;
}

export function LanguageStep({ value, onChange }: LanguageStepProps) {
	const [search, setSearch] = useState("");

	const filteredLanguages = useMemo(() => {
		if (!search.trim()) return LANGUAGES.filter((l) => l.code !== "en");
		const query = search.toLowerCase();
		return LANGUAGES.filter(
			(lang) =>
				lang.code !== "en" &&
				(lang.name.toLowerCase().includes(query) ||
					lang.nativeName.toLowerCase().includes(query) ||
					lang.code.toLowerCase().includes(query)),
		);
	}, [search]);

	// Group by region for better UX
	const popularLanguages = ["hi", "zh", "es", "ar", "pt", "bn", "ru", "ja"];
	const popular = LANGUAGES.filter(
		(l) => popularLanguages.includes(l.code) && l.code !== "en",
	);

	return (
		<div className="space-y-4">
			<div className="text-center space-y-1">
				<p className="text-sm text-muted-foreground">
					Select your native language for personalized translations and
					explanations.
				</p>
			</div>

			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
				<Input
					placeholder="Search languages..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="pl-9"
				/>
			</div>

			{!search && (
				<div className="space-y-2">
					<p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
						Popular
					</p>
					<div className="grid grid-cols-2 gap-2">
						{popular.map((lang) => (
							<LanguageButton
								key={lang.code}
								lang={lang}
								selected={value === lang.code}
								onClick={() => onChange(lang.code)}
							/>
						))}
					</div>
				</div>
			)}

			<div className="space-y-2">
				{!search && (
					<p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
						All Languages
					</p>
				)}
				<div className="max-h-48 overflow-y-auto border">
					{filteredLanguages.length === 0 ? (
						<div className="p-4 text-center text-sm text-muted-foreground">
							No languages found
						</div>
					) : (
						filteredLanguages.map((lang) => (
							<button
								type="button"
								key={lang.code}
								onClick={() => onChange(lang.code)}
								className={cn(
									"flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-secondary transition-colors border-b last:border-b-0",
									value === lang.code && "bg-secondary",
								)}
							>
								<FlagIcon
									countryCode={lang.countryCode}
									className="flex-shrink-0"
								/>
								<div className="flex-1 min-w-0">
									<span className="text-sm font-medium">{lang.name}</span>
									<span className="text-muted-foreground ml-2 text-xs">
										{lang.nativeName}
									</span>
								</div>
								{value === lang.code && (
									<Check className="w-4 h-4 text-primary flex-shrink-0" />
								)}
							</button>
						))
					)}
				</div>
			</div>
		</div>
	);
}

function LanguageButton({
	lang,
	selected,
	onClick,
}: {
	lang: Language;
	selected: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex items-center gap-2 p-2 border transition-colors text-left",
				selected
					? "border-primary bg-primary/5"
					: "border-border hover:border-primary/50",
			)}
		>
			<FlagIcon countryCode={lang.countryCode} className="flex-shrink-0" />
			<div className="min-w-0 flex-1">
				<p className="text-sm font-medium truncate">{lang.name}</p>
				<p className="text-xs text-muted-foreground truncate">
					{lang.nativeName}
				</p>
			</div>
			{selected && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
		</button>
	);
}
