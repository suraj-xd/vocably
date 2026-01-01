"use client";

import { useState } from "react";
import { Bot, Check, Eye, EyeOff, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const AI_PROVIDERS = [
	{
		id: "openai",
		name: "OpenAI",
		description: "GPT-4o-mini",
		placeholder: "sk-...",
		link: "https://platform.openai.com/api-keys",
	},
	{
		id: "anthropic",
		name: "Anthropic",
		description: "Claude Sonnet 4",
		placeholder: "sk-ant-...",
		link: "https://console.anthropic.com/settings/keys",
	},
	{
		id: "google",
		name: "Google AI",
		description: "Gemini 2.0 Flash",
		placeholder: "AIza...",
		link: "https://aistudio.google.com/app/apikey",
	},
] as const;

type ProviderId = (typeof AI_PROVIDERS)[number]["id"];

interface AiConfigStepProps {
	provider: ProviderId;
	apiKey: string;
	onProviderChange: (provider: ProviderId) => void;
	onApiKeyChange: (key: string) => void;
}

export function AiConfigStep({
	provider,
	apiKey,
	onProviderChange,
	onApiKeyChange,
}: AiConfigStepProps) {
	const [showApiKey, setShowApiKey] = useState(false);
	const selectedProvider = AI_PROVIDERS.find((p) => p.id === provider);

	return (
		<div className="space-y-4">
			<div className="text-center space-y-1">
				<p className="text-sm text-muted-foreground">
					Add your API key to enable AI-powered vocabulary generation.
				</p>
			</div>

			<div className="space-y-2">
				{AI_PROVIDERS.map((p) => {
					const isSelected = provider === p.id;

					return (
						<button
							key={p.id}
							type="button"
							onClick={() => onProviderChange(p.id)}
							className={cn(
								"w-full p-3 text-left transition-colors border",
								isSelected
									? "border-primary bg-primary/5"
									: "border-border hover:border-primary/50",
							)}
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<Bot className="w-5 h-5 text-muted-foreground" />
									<div>
										<p className="font-medium text-sm">{p.name}</p>
										<p className="text-xs text-muted-foreground">
											{p.description}
										</p>
									</div>
								</div>
								{isSelected && <Check className="w-4 h-4 text-primary" />}
							</div>
						</button>
					);
				})}
			</div>

			<div className="space-y-2 pt-2 border-t">
				<div className="flex items-center justify-between">
					<label
						htmlFor="apiKey"
						className="text-sm font-medium"
					>
						{selectedProvider?.name} API Key
					</label>
					<a
						href={selectedProvider?.link}
						target="_blank"
						rel="noopener noreferrer"
						className="text-xs text-primary hover:underline flex items-center gap-1"
					>
						Get API key
						<ExternalLink className="w-3 h-3" />
					</a>
				</div>
				<div className="relative">
					<Input
						id="apiKey"
						type={showApiKey ? "text" : "password"}
						placeholder={selectedProvider?.placeholder}
						value={apiKey}
						onChange={(e) => onApiKeyChange(e.target.value)}
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
					Your key is stored securely and only used to generate vocabulary.
				</p>
			</div>
		</div>
	);
}
