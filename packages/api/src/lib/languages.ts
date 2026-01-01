// Language definitions for native language preference
export interface Language {
	code: string; // ISO 639-1 code (e.g., "hi")
	name: string; // English name (e.g., "Hindi")
	nativeName: string; // Native name (e.g., "हिन्दी")
	countryCode: string; // ISO 3166-1 alpha-2 for flag (e.g., "IN")
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

export function getLanguageByCode(code: string): Language | undefined {
	return LANGUAGES.find((lang) => lang.code === code);
}

export function getLanguageName(code: string): string {
	return getLanguageByCode(code)?.name ?? "Unknown";
}

export function getNativeLanguageName(code: string): string {
	return getLanguageByCode(code)?.nativeName ?? code;
}
