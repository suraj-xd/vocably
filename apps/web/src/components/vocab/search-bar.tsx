"use client";

import { useState, useEffect } from "react";
import { useQueryState } from "nuqs";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchBar() {
	const [urlQuery, setUrlQuery] = useQueryState("q", {
		defaultValue: "",
		shallow: true,
	});
	const [localQuery, setLocalQuery] = useState(urlQuery);

	useEffect(() => {
		setLocalQuery(urlQuery);
	}, [urlQuery]);

	useEffect(() => {
		const timer = setTimeout(() => {
			setUrlQuery(localQuery || null);
		}, 300);
		return () => clearTimeout(timer);
	}, [localQuery, setUrlQuery]);

	const handleClear = () => {
		setLocalQuery("");
		setUrlQuery(null);
	};

	return (
		<div className="relative">
			<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
			<Input
				type="search"
				placeholder="Search vocabulary..."
				value={localQuery}
				onChange={(e) => setLocalQuery(e.target.value)}
				className="pl-9 pr-9 w-full sm:w-[300px]"
			/>
			{localQuery && (
				<button
					type="button"
					onClick={handleClear}
					className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
				>
					<X className="w-4 h-4" />
				</button>
			)}
		</div>
	);
}
