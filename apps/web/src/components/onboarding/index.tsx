"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { client } from "@/utils/orpc";

import { ProgressIndicator } from "./progress-indicator";
import { WelcomeStep } from "./steps/welcome";
import { LanguageStep } from "./steps/language";
import { AiConfigStep } from "./steps/ai-config";
import { CliStep } from "./steps/cli";
import { McpStep } from "./steps/mcp";
import { GetStartedStep } from "./steps/get-started";

type AiProvider = "openai" | "anthropic" | "google";

const STEPS = [
	{ id: "welcome", title: "Welcome", description: "Let's get you set up" },
	{
		id: "language",
		title: "Native Language",
		description: "For personalized translations",
	},
	{
		id: "ai-config",
		title: "AI Configuration",
		description: "Enable AI-powered definitions",
		skippable: true,
	},
	{
		id: "cli",
		title: "CLI Setup",
		description: "Add words from terminal",
		skippable: true,
	},
	{
		id: "mcp",
		title: "Claude Desktop",
		description: "Connect with Claude",
		skippable: true,
	},
	{
		id: "get-started",
		title: "Ready!",
		description: "Start building your vocabulary",
	},
];

interface OnboardingDialogProps {
	initialStep?: number;
}

export function OnboardingDialog({ initialStep = 0 }: OnboardingDialogProps) {
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(true);
	const [currentStep, setCurrentStep] = useState(initialStep);
	const [isNavigating, setIsNavigating] = useState(false);

	// Form state
	const [nativeLanguage, setNativeLanguage] = useState("hi");
	const [aiProvider, setAiProvider] = useState<AiProvider>("openai");
	const [aiApiKey, setAiApiKey] = useState("");

	// Track if user entered an API key
	const hasEnteredApiKey = aiApiKey.trim().length > 0;

	const stepMutation = useMutation({
		mutationFn: ({
			step,
			data,
		}: {
			step: number;
			data?: {
				nativeLanguage?: string;
				aiProvider?: AiProvider;
				aiApiKey?: string;
			};
		}) => client.userSettings.updateOnboardingStep({ step, data }),
	});

	const completeMutation = useMutation({
		mutationFn: () => client.userSettings.completeOnboarding(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["onboardingStatus"] });
			queryClient.invalidateQueries({ queryKey: ["userSettings"] });
		},
	});

	async function saveStepData(step: number) {
		const data: {
			nativeLanguage?: string;
			aiProvider?: AiProvider;
			aiApiKey?: string;
		} = {};

		if (step === 1) {
			data.nativeLanguage = nativeLanguage;
		} else if (step === 2 && hasEnteredApiKey) {
			data.aiProvider = aiProvider;
			data.aiApiKey = aiApiKey;
		}

		if (Object.keys(data).length > 0) {
			await stepMutation.mutateAsync({ step, data });
		} else {
			await stepMutation.mutateAsync({ step });
		}
	}

	async function handleNext() {
		setIsNavigating(true);
		try {
			await saveStepData(currentStep);

			if (currentStep === STEPS.length - 1) {
				// Final step - complete onboarding
				await completeMutation.mutateAsync();
				setOpen(false);
				toast.success("Welcome to Vocably!");
			} else {
				setCurrentStep((prev) => prev + 1);
			}
		} catch (error) {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsNavigating(false);
		}
	}

	async function handleBack() {
		if (currentStep > 0) {
			setCurrentStep((prev) => prev - 1);
		}
	}

	async function handleSkip() {
		setIsNavigating(true);
		try {
			// Save step progress without data
			await stepMutation.mutateAsync({ step: currentStep });

			// Show nudge for AI config step
			if (currentStep === 2) {
				toast("AI features will be limited without an API key", {
					description: "You can add one later in Settings → AI Configuration",
				});
			}

			setCurrentStep((prev) => prev + 1);
		} catch (error) {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsNavigating(false);
		}
	}

	const step = STEPS[currentStep];
	const isFirstStep = currentStep === 0;
	const isLastStep = currentStep === STEPS.length - 1;

	// Validation for next button
	const canProceed = () => {
		if (currentStep === 1) {
			return nativeLanguage.length > 0;
		}
		return true;
	};

	function renderStep() {
		switch (currentStep) {
			case 0:
				return <WelcomeStep onNext={handleNext} />;
			case 1:
				return (
					<LanguageStep
						value={nativeLanguage}
						onChange={setNativeLanguage}
					/>
				);
			case 2:
				return (
					<AiConfigStep
						provider={aiProvider}
						apiKey={aiApiKey}
						onProviderChange={setAiProvider}
						onApiKeyChange={setAiApiKey}
					/>
				);
			case 3:
				return <CliStep />;
			case 4:
				return <McpStep />;
			case 5:
				return <GetStartedStep hasApiKey={hasEnteredApiKey} />;
			default:
				return null;
		}
	}

	return (
		<Dialog open={open} onOpenChange={() => {}}>
			<DialogContent
				className="sm:max-w-[480px] p-0 gap-0"
				onInteractOutside={(e) => e.preventDefault()}
				onEscapeKeyDown={(e) => e.preventDefault()}
			>
				{/* Header with progress */}
				<div className="px-6 pt-6 pb-4 border-b space-y-4">
					<ProgressIndicator
						currentStep={currentStep}
						totalSteps={STEPS.length}
					/>
					<DialogHeader>
						<DialogTitle>{step.title}</DialogTitle>
						<DialogDescription>{step.description}</DialogDescription>
					</DialogHeader>
				</div>

				{/* Content */}
				<div className="px-6 py-6">{renderStep()}</div>

				{/* Footer */}
				<DialogFooter className="px-6 py-4 border-t flex-row justify-between sm:justify-between">
					<div>
						{!isFirstStep && (
							<Button
								variant="ghost"
								onClick={handleBack}
								disabled={isNavigating}
							>
								<ArrowLeft className="w-4 h-4 mr-2" />
								Back
							</Button>
						)}
					</div>

					<div className="flex items-center gap-2">
						{step.skippable && (
							<Button
								variant="ghost"
								onClick={handleSkip}
								disabled={isNavigating}
							>
								Skip
							</Button>
						)}
						<Button
							onClick={handleNext}
							disabled={isNavigating || !canProceed()}
						>
							{isNavigating ? (
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
							) : null}
							{isLastStep ? "Get Started" : "Next"}
							{!isLastStep && !isNavigating && (
								<ArrowRight className="w-4 h-4 ml-2" />
							)}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
