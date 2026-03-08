import type { Metadata } from "next";

import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";

import "../index.css";
import Header from "@/components/header";
import Providers from "@/components/providers";

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-jetbrains-mono",
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
});

const departureMono = localFont({
	src: "../../public/fonts/DepartureMono-Regular.woff2",
	variable: "--font-departure-mono",
	display: "swap",
});

export const metadata: Metadata = {
	title: "Vocab - Vocabulary Learning System",
	description:
		"A comprehensive vocabulary learning system for Hindi speakers learning English",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${jetbrainsMono.variable} ${departureMono.variable} font-mono antialiased`}>
				<Providers>
					<div className="flex flex-col min-h-svh">
						<Header />
						<main className="flex-1">{children}</main>
					</div>
				</Providers>
				<Analytics />
			</body>
		</html>
	);
}
