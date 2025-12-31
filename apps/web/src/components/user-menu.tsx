"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Settings, LogOut, User, LayoutDashboard } from "lucide-react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

export default function UserMenu() {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return <Skeleton className="h-8 w-20" />;
	}

	if (!session) {
		return (
			<Link href="/login">
				<Button variant="outline" size="sm">
					Sign In
				</Button>
			</Link>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button variant="ghost" size="sm" className="gap-2">
						<User className="h-4 w-4" />
						<span className="hidden sm:inline">{session.user.name}</span>
					</Button>
				}
			/>
			<DropdownMenuContent align="end" className="w-56 bg-card">
				<DropdownMenuGroup>
					<DropdownMenuLabel className="font-normal">
						<div className="flex flex-col gap-1">
							<p className="text-sm font-medium">{session.user.name}</p>
							<p className="text-xs text-muted-foreground">{session.user.email}</p>
						</div>
					</DropdownMenuLabel>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem onClick={() => router.push("/dashboard")}>
						<LayoutDashboard className="mr-2 h-4 w-4" />
						Dashboard
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
						<Settings className="mr-2 h-4 w-4" />
						Settings
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					variant="destructive"
					onClick={() => {
						authClient.signOut({
							fetchOptions: {
								onSuccess: () => {
									router.push("/");
								},
							},
						});
					}}
				>
					<LogOut className="mr-2 h-4 w-4" />
					Sign Out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
