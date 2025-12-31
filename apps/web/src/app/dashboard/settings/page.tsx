"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export default function SettingsPage() {
	const router = useRouter();
	const [deleteConfirmation, setDeleteConfirmation] = useState("");
	const [password, setPassword] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const [needsPassword, setNeedsPassword] = useState(false);

	const { isLoading } = useQuery({
		queryKey: ["session"],
		queryFn: async () => {
			const result = await authClient.getSession();
			return result;
		},
	});

	const handleDeleteAccount = async () => {
		if (deleteConfirmation !== "delete") return;

		setIsDeleting(true);
		setDeleteError(null);

		try {
			const result = await authClient.deleteUser({
				password: password || undefined,
			});

			if (result.error) {
				// Check if password is required
				if (result.error.message?.includes("password") || result.error.code === "PASSWORD_REQUIRED") {
					setNeedsPassword(true);
					setDeleteError("Password required. Please enter your password to delete your account.");
					setIsDeleting(false);
					return;
				}
				throw new Error(result.error.message || "Failed to delete account");
			}

			router.push("/");
		} catch (error) {
			setDeleteError(error instanceof Error ? error.message : "Failed to delete account");
			setIsDeleting(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-20">
				<Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Account section - commented out as auth handles this
			<Card>
				<CardHeader>
					<CardTitle>Account</CardTitle>
					<CardDescription>Your account information</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<p className="text-sm text-muted-foreground">Name</p>
						<p className="font-medium">{session?.user?.name || "—"}</p>
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Email</p>
						<p className="font-medium">{session?.user?.email || "—"}</p>
					</div>
				</CardContent>
			</Card>
			*/}

			{/* Statistics section - coming soon
			<Card>
				<CardHeader>
					<CardTitle>Statistics</CardTitle>
					<CardDescription>Your vocabulary learning progress</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Statistics and learning analytics coming soon.
					</p>
				</CardContent>
			</Card>
			*/}

			<Card className="border-destructive/20">
				<CardHeader>
					<CardTitle className="text-destructive">Danger Zone</CardTitle>
					<CardDescription>Irreversible actions</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium">Delete Account</p>
							<p className="text-sm text-muted-foreground">
								Permanently delete your account and all associated data
							</p>
						</div>
						<AlertDialog>
							<AlertDialogTrigger
								render={
									<Button variant="destructive" size="sm">
										<Trash2 className="w-4 h-4 mr-2" />
										Delete Account
									</Button>
								}
							/>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Delete Account</AlertDialogTitle>
									<AlertDialogDescription>
										This action cannot be undone. This will permanently delete your account
										and remove all your data including vocabulary words, categories, tags,
										and API tokens.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="delete-confirmation" className="text-sm text-muted-foreground">
											Type <span className="font-mono font-bold text-foreground">delete</span> to confirm:
										</Label>
										<Input
											id="delete-confirmation"
											value={deleteConfirmation}
											onChange={(e) => setDeleteConfirmation(e.target.value)}
											placeholder="delete"
											className="font-mono"
										/>
									</div>
									{needsPassword && (
										<div className="space-y-2">
											<Label htmlFor="delete-password" className="text-sm text-muted-foreground">
												Enter your password:
											</Label>
											<Input
												id="delete-password"
												type="password"
												value={password}
												onChange={(e) => setPassword(e.target.value)}
												placeholder="Password"
											/>
										</div>
									)}
									{deleteError && (
										<p className="text-sm text-destructive">{deleteError}</p>
									)}
								</div>
								<AlertDialogFooter>
									<AlertDialogCancel onClick={() => {
										setDeleteConfirmation("");
										setPassword("");
										setDeleteError(null);
										setNeedsPassword(false);
									}}>
										Cancel
									</AlertDialogCancel>
									<AlertDialogAction
										onClick={handleDeleteAccount}
										disabled={deleteConfirmation !== "delete" || isDeleting || (needsPassword && !password)}
										className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
									>
										{isDeleting ? (
											<>
												<Loader2 className="w-4 h-4 mr-2 animate-spin" />
												Deleting...
											</>
										) : (
											"Delete Account"
										)}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
