"use client";

import { useState, useMemo } from "react";
import { Check, ChevronDown, Search, Globe } from "lucide-react";
import * as Flags from "country-flag-icons/react/3x2";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Language data (same as packages/api/src/lib/languages.ts)
export interface Language {
	code: string;
	name: string;
	nativeName: string;
	countryCode: string;
}

export const LANGUAGES: Language[] = [
	// Default
	{ code: "en", name: "English", nativeName: "English", countryCode: "US" },

	// South Asian languages
	{ code: "hi", name: "Hindi", nativeName: "हिन्दी", countryCode: "IN" },
	{ code: "bn", name: "Bengali", nativeName: "বাংলা", countryCode: "BD" },
	{ code: "ta", name: "Tamil", nativeName: "தமிழ்", countryCode: "IN" },
	{ code: "te", name: "Telugu", nativeName: "తెలుగు", countryCode: "IN" },
	{ code: "mr", name: "Marathi", nativeName: "मराठी", countryCode: "IN" },
	{ code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", countryCode: "IN" },
	{ code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", countryCode: "IN" },
	{ code: "ml", name: "Malayalam", nativeName: "മലയാളം", countryCode: "IN" },
	{ code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", countryCode: "IN" },
	{ code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", countryCode: "IN" },
	{ code: "ur", name: "Urdu", nativeName: "اردو", countryCode: "PK" },
	{ code: "ne", name: "Nepali", nativeName: "नेपाली", countryCode: "NP" },
	{ code: "si", name: "Sinhala", nativeName: "සිංහල", countryCode: "LK" },

	// East Asian languages
	{ code: "zh", name: "Chinese (Mandarin)", nativeName: "中文", countryCode: "CN" },
	{ code: "ja", name: "Japanese", nativeName: "日本語", countryCode: "JP" },
	{ code: "ko", name: "Korean", nativeName: "한국어", countryCode: "KR" },
	{ code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", countryCode: "VN" },
	{ code: "th", name: "Thai", nativeName: "ไทย", countryCode: "TH" },
	{ code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", countryCode: "ID" },
	{ code: "ms", name: "Malay", nativeName: "Bahasa Melayu", countryCode: "MY" },
	{ code: "tl", name: "Filipino", nativeName: "Tagalog", countryCode: "PH" },
	{ code: "my", name: "Burmese", nativeName: "မြန်မာဘာသာ", countryCode: "MM" },
	{ code: "km", name: "Khmer", nativeName: "ភាសាខ្មែរ", countryCode: "KH" },

	// European languages
	{ code: "es", name: "Spanish", nativeName: "Español", countryCode: "ES" },
	{ code: "fr", name: "French", nativeName: "Français", countryCode: "FR" },
	{ code: "de", name: "German", nativeName: "Deutsch", countryCode: "DE" },
	{ code: "it", name: "Italian", nativeName: "Italiano", countryCode: "IT" },
	{ code: "pt", name: "Portuguese", nativeName: "Português", countryCode: "BR" },
	{ code: "ru", name: "Russian", nativeName: "Русский", countryCode: "RU" },
	{ code: "nl", name: "Dutch", nativeName: "Nederlands", countryCode: "NL" },
	{ code: "pl", name: "Polish", nativeName: "Polski", countryCode: "PL" },
	{ code: "uk", name: "Ukrainian", nativeName: "Українська", countryCode: "UA" },
	{ code: "ro", name: "Romanian", nativeName: "Română", countryCode: "RO" },
	{ code: "el", name: "Greek", nativeName: "Ελληνικά", countryCode: "GR" },
	{ code: "cs", name: "Czech", nativeName: "Čeština", countryCode: "CZ" },
	{ code: "hu", name: "Hungarian", nativeName: "Magyar", countryCode: "HU" },
	{ code: "sv", name: "Swedish", nativeName: "Svenska", countryCode: "SE" },
	{ code: "da", name: "Danish", nativeName: "Dansk", countryCode: "DK" },
	{ code: "fi", name: "Finnish", nativeName: "Suomi", countryCode: "FI" },
	{ code: "no", name: "Norwegian", nativeName: "Norsk", countryCode: "NO" },
	{ code: "sk", name: "Slovak", nativeName: "Slovenčina", countryCode: "SK" },
	{ code: "bg", name: "Bulgarian", nativeName: "Български", countryCode: "BG" },
	{ code: "hr", name: "Croatian", nativeName: "Hrvatski", countryCode: "HR" },
	{ code: "sr", name: "Serbian", nativeName: "Српски", countryCode: "RS" },
	{ code: "lt", name: "Lithuanian", nativeName: "Lietuvių", countryCode: "LT" },
	{ code: "lv", name: "Latvian", nativeName: "Latviešu", countryCode: "LV" },
	{ code: "et", name: "Estonian", nativeName: "Eesti", countryCode: "EE" },

	// Middle Eastern languages
	{ code: "ar", name: "Arabic", nativeName: "العربية", countryCode: "SA" },
	{ code: "fa", name: "Persian", nativeName: "فارسی", countryCode: "IR" },
	{ code: "he", name: "Hebrew", nativeName: "עברית", countryCode: "IL" },
	{ code: "tr", name: "Turkish", nativeName: "Türkçe", countryCode: "TR" },

	// African languages
	{ code: "sw", name: "Swahili", nativeName: "Kiswahili", countryCode: "KE" },
	{ code: "am", name: "Amharic", nativeName: "አማርኛ", countryCode: "ET" },
	{ code: "ha", name: "Hausa", nativeName: "Hausa", countryCode: "NG" },
	{ code: "yo", name: "Yoruba", nativeName: "Yorùbá", countryCode: "NG" },
	{ code: "zu", name: "Zulu", nativeName: "isiZulu", countryCode: "ZA" },
	{ code: "af", name: "Afrikaans", nativeName: "Afrikaans", countryCode: "ZA" },
];

// Dynamic flag component
function FlagIcon({
	countryCode,
	className,
}: { countryCode: string; className?: string }) {
	const FlagComponent = Flags[countryCode as keyof typeof Flags];
	if (!FlagComponent) return <Globe className={cn("w-5 h-4", className)} />;
	return <FlagComponent className={cn("w-5 h-auto", className)} />;
}

interface LanguageSelectorProps {
	value: string;
	onChange: (code: string) => void;
	disabled?: boolean;
}

export function LanguageSelector({
	value,
	onChange,
	disabled,
}: LanguageSelectorProps) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");

	const filteredLanguages = useMemo(() => {
		if (!search.trim()) return LANGUAGES;
		const query = search.toLowerCase();
		return LANGUAGES.filter(
			(lang) =>
				lang.name.toLowerCase().includes(query) ||
				lang.nativeName.toLowerCase().includes(query) ||
				lang.code.toLowerCase().includes(query),
		);
	}, [search]);

	const selectedLanguage = LANGUAGES.find((l) => l.code === value);

	const handleSelect = (code: string) => {
		onChange(code);
		setOpen(false);
		setSearch("");
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					disabled={disabled}
					className="w-full justify-between font-normal"
				>
					<div className="flex items-center gap-3">
						{selectedLanguage && (
							<FlagIcon countryCode={selectedLanguage.countryCode} />
						)}
						<span>
							{selectedLanguage?.name ?? "Select language"}
							{selectedLanguage && (
								<span className="text-muted-foreground ml-2">
									({selectedLanguage.nativeName})
								</span>
							)}
						</span>
					</div>
					<ChevronDown className="w-4 h-4 text-muted-foreground" />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-md p-0">
				<DialogHeader className="p-4 pb-0">
					<DialogTitle>Select Your Native Language</DialogTitle>
				</DialogHeader>
				<div className="p-4 pt-2">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
						<Input
							placeholder="Search languages..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-9"
							autoFocus
						/>
					</div>
				</div>
				<div className="max-h-80 overflow-y-auto border-t">
					{filteredLanguages.length === 0 ? (
						<div className="p-4 text-center text-sm text-muted-foreground">
							No languages found
						</div>
					) : (
						filteredLanguages.map((lang) => (
							<button
								type="button"
								key={lang.code}
								onClick={() => handleSelect(lang.code)}
								className={cn(
									"flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-secondary transition-colors",
									value === lang.code && "bg-secondary",
								)}
							>
								<FlagIcon
									countryCode={lang.countryCode}
									className="flex-shrink-0"
								/>
								<div className="flex-1 min-w-0">
									<span className="font-medium">{lang.name}</span>
									<span className="text-muted-foreground ml-2 text-sm">
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
			</DialogContent>
		</Dialog>
	);
}

export function getLanguageName(code: string): string {
	return LANGUAGES.find((l) => l.code === code)?.name ?? "Unknown";
}

export function getNativeLanguageName(code: string): string {
	return LANGUAGES.find((l) => l.code === code)?.nativeName ?? code;
}
