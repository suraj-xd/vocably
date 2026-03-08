"use client";

import Link from "next/link";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import { WordOfDayBanner } from "./landing/word-of-day-banner";

export default function Header() {
	return (
		<header className="border-b border-border">
			<div className="flex flex-row items-center justify-between px-4 py-3 gap-4">
				<div className="flex items-center gap-4">
					<Link
						href="/"
						className="text-sm font-medium hover:text-muted-foreground transition-colors font-departure"
					>
						vocably
					</Link>
					<Link
						href="/library"
						className="text-xs text-muted-foreground hover:text-foreground transition-colors"
					>
						Library
					</Link>
				</div>
				<WordOfDayBanner />
				<div className="flex items-center gap-3">
					<ModeToggle />
					<UserMenu />
				</div>
			</div>
		</header>
	);
}
