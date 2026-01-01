"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bot, Check, Eye, EyeOff, Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { client } from "@/utils/orpc";

const AI_PROVIDERS = [
	{
		id: "openai",
		name: "OpenAI",
		description: "GPT-4o-mini (fast & affordable)",
		placeholder: "sk-...",
	},
	{
		id: "anthropic",
		name: "Anthropic",
		description: "Claude Sonnet 4",
		placeholder: "sk-ant-...",
	},
	{
		id: "google",
		name: "Google AI",
		description: "Gemini 2.0 Flash",
		placeholder: "AIza...",
	},
] as const;

type ProviderId = (typeof AI_PROVIDERS)[number]["id"];

export default function AiConfigPage() {
	const queryClient = useQueryClient();
	const [selectedProvider, setSelectedProvider] = useState<ProviderId | null>(null);
	const [apiKey, setApiKey] = useState("");
	const [showApiKey, setShowApiKey] = useState(false);

	const { data: settings, isLoading } = useQuery({
		queryKey: ["userSettings"],
		queryFn: () => client.userSettings.get(),
	});

	const saveMutation = useMutation({
		mutationFn: ({ provider, key }: { provider: ProviderId; key: string }) =>
			client.userSettings.update({ aiProvider: provider, aiApiKey: key }),
		onSuccess: () => {
			toast.success("AI configuration saved");
			setApiKey("");
			setSelectedProvider(null);
			queryClient.invalidateQueries({ queryKey: ["userSettings"] });
		},
		onError: () => {
			toast.error("Failed to save configuration");
		},
	});

	const clearMutation = useMutation({
		mutationFn: () => client.userSettings.clearApiKey(),
		onSuccess: () => {
			toast.success("API key removed");
			queryClient.invalidateQueries({ queryKey: ["userSettings"] });
		},
		onError: () => {
			toast.error("Failed to remove API key");
		},
	});

	function handleSave() {
		if (!selectedProvider || !apiKey.trim()) return;
		saveMutation.mutate({ provider: selectedProvider, key: apiKey.trim() });
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-20">
				<Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Current Configuration */}
			{settings?.hasApiKey && (
				<Card className="border-primary/20 bg-primary/5">
					<CardHeader>
						<CardTitle className="text-lg">Current Configuration</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium">
									{AI_PROVIDERS.find((p) => p.id === settings.aiProvider)?.name || settings.aiProvider}
								</p>
								<p className="text-sm text-muted-foreground font-mono">
									{settings.apiKeyPreview}
								</p>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									if (confirm("Remove your API key? You'll need to add a new one to use AI features.")) {
										clearMutation.mutate();
									}
								}}
								disabled={clearMutation.isPending}
							>
								<Trash2 className="w-4 h-4 mr-2" />
								Remove
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader>
					<CardTitle>{settings?.hasApiKey ? "Change AI Provider" : "Configure AI Provider"}</CardTitle>
					<CardDescription>
						{settings?.hasApiKey
							? "Switch to a different AI provider"
							: "Add your API key to enable AI-powered vocabulary generation"}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-3">
						{AI_PROVIDERS.map((provider) => {
							const isSelected = selectedProvider === provider.id;
							const isCurrent = settings?.aiProvider === provider.id && settings?.hasApiKey;

							return (
								<button
									key={provider.id}
									type="button"
									onClick={() => setSelectedProvider(provider.id)}
									className={`w-full p-4 text-left transition-colors border ${
										isSelected
											? "border-primary bg-primary/5"
											: isCurrent
												? "border-primary/30"
												: "border-border hover:border-primary/50"
									}`}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<Bot className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="font-medium">
													{provider.name}
													{isCurrent && (
														<span className="ml-2 text-xs text-primary">
															Active
														</span>
													)}
												</p>
												<p className="text-sm text-muted-foreground">
													{provider.description}
												</p>
											</div>
										</div>
										{isSelected && (
											<Check className="w-5 h-5 text-primary" />
										)}
									</div>
								</button>
							);
						})}
					</div>

					{selectedProvider && (
						<div className="space-y-4 pt-4 border-t">
							<div className="space-y-2">
								<Label htmlFor="apiKey">
									{AI_PROVIDERS.find((p) => p.id === selectedProvider)?.name} API Key
								</Label>
								<div className="relative">
									<Input
										id="apiKey"
										type={showApiKey ? "text" : "password"}
										placeholder={
											AI_PROVIDERS.find((p) => p.id === selectedProvider)?.placeholder
										}
										value={apiKey}
										onChange={(e) => setApiKey(e.target.value)}
										className="pr-10"
									/>
									<button
										type="button"
										onClick={() => setShowApiKey(!showApiKey)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
									>
										{showApiKey ? (
											<EyeOff className="w-4 h-4" />
										) : (
											<Eye className="w-4 h-4" />
										)}
									</button>
								</div>
								<p className="text-xs text-muted-foreground">
									Your API key is stored securely. It's only used to generate vocabulary definitions.
								</p>
							</div>

							<Button
								onClick={handleSave}
								disabled={!apiKey.trim() || saveMutation.isPending}
							>
								{saveMutation.isPending ? (
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								) : (
									<Save className="w-4 h-4 mr-2" />
								)}
								Save Configuration
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>How It Works</CardTitle>
					<CardDescription>AI-powered vocabulary generation</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4 text-sm text-muted-foreground">
					<p>
						When you add a new word, AI generates comprehensive vocabulary data including:
					</p>
					<ul className="list-disc list-inside space-y-1 ml-2">
						<li>Definition and meaning</li>
						<li>Part of speech and pronunciation</li>
						<li>Memorable explanation (tailored for your native language)</li>
						<li>Translation and cultural context in your native language</li>
						<li>Usage examples (2-3 sentences)</li>
						<li>Synonyms and antonyms</li>
						<li>Difficulty level</li>
						<li>Category and related words</li>
					</ul>
					<p className="pt-2">
						<strong>Get API keys:</strong>
					</p>
					<ul className="list-disc list-inside space-y-1 ml-2">
						<li><a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener" className="underline">OpenAI API Keys</a></li>
						<li><a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener" className="underline">Anthropic API Keys</a></li>
						<li><a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener" className="underline">Google AI API Keys</a></li>
					</ul>
				</CardContent>
			</Card>
		</div>
	);
}
