import Link from "next/link";

export function Footer() {
	return (
		<footer className="border-t border-border py-6 px-4">
			<div className="container mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
				<div>Built with care</div>
				<div className="flex items-center gap-4">
					<Link
						href="https://github.com/suraj-xd/vocably"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-foreground transition-colors"
					>
						GitHub
					</Link>
					<span className="text-border">|</span>
					<span>MIT License</span>
				</div>
			</div>
		</footer>
	);
}
