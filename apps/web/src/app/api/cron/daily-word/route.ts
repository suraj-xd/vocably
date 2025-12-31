import { NextRequest, NextResponse } from "next/server";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export async function GET(request: NextRequest) {
	// Verify the request is from Vercel Cron
	const authHeader = request.headers.get("authorization");
	const cronSecret = process.env.CRON_SECRET;

	// In production, verify the cron secret
	if (process.env.NODE_ENV === "production") {
		if (!cronSecret) {
			return NextResponse.json(
				{ error: "CRON_SECRET not configured" },
				{ status: 500 },
			);
		}

		if (authHeader !== `Bearer ${cronSecret}`) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 },
			);
		}
	}

	try {
		// Call the server's daily word processing endpoint
		const response = await fetch(`${SERVER_URL}/rpc/dailyWord.processAll`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				cronSecret: cronSecret || "dev-secret",
			}),
		});

		if (!response.ok) {
			const error = await response.text();
			console.error("Daily word processing failed:", error);
			return NextResponse.json(
				{ error: "Processing failed", details: error },
				{ status: 500 },
			);
		}

		const result = await response.json();

		return NextResponse.json({
			success: true,
			message: `Daily word "${result.term}" processed for ${result.stats.processed} users`,
			...result,
		});
	} catch (error) {
		console.error("Daily word cron error:", error);
		return NextResponse.json(
			{ error: "Internal server error", details: String(error) },
			{ status: 500 },
		);
	}
}

// Also allow POST for manual triggering
export async function POST(request: NextRequest) {
	return GET(request);
}
