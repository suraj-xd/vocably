"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Globe, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { LanguageSelector } from "@/components/language-selector";
import { client } from "@/utils/orpc";

export default function LanguageSettingsPage() {
	const queryClient = useQueryClient();
	const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

	const { data: settings, isLoading } = useQuery({
		queryKey: ["userSettings"],
		queryFn: () => client.userSettings.get(),
	});

	// Initialize selected language from settings
	useEffect(() => {
		if (settings?.nativeLanguage && selectedLanguage === null) {
			setSelectedLanguage(settings.nativeLanguage);
		}
	}, [settings, selectedLanguage]);

	const saveMutation = useMutation({
		mutationFn: (nativeLanguage: string) =>
			client.userSettings.update({ nativeLanguage }),
		onSuccess: () => {
			toast.success("Native language updated");
			queryClient.invalidateQueries({ queryKey: ["userSettings"] });
		},
		onError: () => {
			toast.error("Failed to update language");
		},
	});

	const hasChanges = selectedLanguage !== settings?.nativeLanguage;

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-20">
				<Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Globe className="w-5 h-5" />
						Native Language
					</CardTitle>
					<CardDescription>
						Select your native language for personalized translations and
						cultural context when learning new vocabulary.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-2">
						<label className="text-sm font-medium">I speak</label>
						<LanguageSelector
							value={selectedLanguage ?? "en"}
							onChange={setSelectedLanguage}
							disabled={saveMutation.isPending}
						/>
						<p className="text-xs text-muted-foreground">
							New vocabulary words will include translations and cultural
							context in your selected language.
						</p>
					</div>

					{hasChanges && (
						<Button
							onClick={() =>
								selectedLanguage && saveMutation.mutate(selectedLanguage)
							}
							disabled={saveMutation.isPending || !selectedLanguage}
						>
							{saveMutation.isPending ? (
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
							) : (
								<Save className="w-4 h-4 mr-2" />
							)}
							Save Changes
						</Button>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>How It Works</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4 text-sm text-muted-foreground">
					<p>
						When you add a new word, the AI will generate vocabulary data
						tailored for speakers of your native language:
					</p>
					<ul className="list-disc list-inside space-y-1 ml-2">
						<li>Translations in your native language script</li>
						<li>
							Cultural connections and context relevant to your background
						</li>
						<li>Memorable explanations using familiar concepts</li>
						<li>Pronunciation guides optimized for your language</li>
					</ul>
					<p className="pt-2 text-xs">
						Note: Changing your native language only affects newly added words.
						Existing vocabulary retains its original translations.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
