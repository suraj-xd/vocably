"use client";

import Link from "next/link";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
	return (
		<header className="border-b border-border">
			<div className="flex flex-row items-center justify-between px-4 py-3">
				<Link href="/" className="text-sm font-medium hover:text-muted-foreground transition-colors">
					vocably
				</Link>
				<div className="flex items-center gap-3">
					<ModeToggle />
					<UserMenu />
				</div>
			</div>
		</header>
	);
}
