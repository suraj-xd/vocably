import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { db } from "@vocably/db";
import { word, category, apiToken } from "@vocably/db/schema";
import { eq, desc, and, or, ilike } from "drizzle-orm";
import { createHash, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

// Store active transports by session ID (note: in serverless, this resets between invocations)
const transports: Record<string, StreamableHTTPServerTransport> = {};

// Validate API token and get user ID
async function validateToken(token: string): Promise<string | null> {
	if (!token.startsWith("vocably_")) {
		return null;
	}

	const tokenHash = createHash("sha256").update(token).digest("hex");

	const [tokenRecord] = await db
		.select()
		.from(apiToken)
		.where(and(eq(apiToken.tokenHash, tokenHash), eq(apiToken.isActive, true)))
		.limit(1);

	if (!tokenRecord) {
		return null;
	}

	if (tokenRecord.expiresAt && tokenRecord.expiresAt < new Date()) {
		return null;
	}

	await db
		.update(apiToken)
		.set({ lastUsedAt: new Date() })
		.where(eq(apiToken.id, tokenRecord.id));

	return tokenRecord.userId;
}

// Create MCP server with tools for a specific user
function createMcpServer(userId: string): McpServer {
	const server = new McpServer({
		name: "vocably",
		version: "1.0.0",
	});

	// Add Word Tool
	server.registerTool(
		"add-word",
		{
			title: "Add Vocabulary Word",
			description: "Add a new vocabulary word to your collection",
			inputSchema: {
				term: z.string().describe("The vocabulary word to add"),
				notes: z.string().optional().describe("Personal notes about the word"),
				context: z.string().optional().describe("Where you encountered the word"),
			},
		},
		async ({ term, notes, context }) => {
			try {
				const termLower = (term as string).toLowerCase().trim();

				const existing = await db.query.word.findFirst({
					where: and(eq(word.userId, userId), eq(word.term, termLower)),
				});

				if (existing) {
					return {
						content: [{ type: "text", text: `Word "${termLower}" already exists` }],
						isError: true,
					};
				}

				const [newWord] = await db
					.insert(word)
					.values({
						userId,
						term: termLower,
						notes: notes as string | undefined,
						context: context as string | undefined,
						source: "mcp",
						aiStatus: "pending",
					})
					.returning();

				return {
					content: [{ type: "text", text: JSON.stringify({ success: true, message: `Added "${termLower}"`, word: newWord }, null, 2) }],
				};
			} catch (error) {
				return {
					content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
					isError: true,
				};
			}
		}
	);

	// List Words Tool
	server.registerTool(
		"list-words",
		{
			title: "List Vocabulary",
			description: "List all vocabulary words",
			inputSchema: {
				limit: z.number().optional().default(20).describe("Maximum number of words"),
			},
		},
		async ({ limit }) => {
			try {
				const words = await db.query.word.findMany({
					where: eq(word.userId, userId),
					limit: (limit as number) || 20,
					orderBy: desc(word.createdAt),
					with: { category: true },
				});

				return {
					content: [{ type: "text", text: JSON.stringify({ words }, null, 2) }],
				};
			} catch (error) {
				return {
					content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
					isError: true,
				};
			}
		}
	);

	// Get Word Tool
	server.registerTool(
		"get-word",
		{
			title: "Get Word Details",
			description: "Get details about a specific word",
			inputSchema: {
				term: z.string().describe("The word to look up"),
			},
		},
		async ({ term }) => {
			try {
				const result = await db.query.word.findFirst({
					where: and(
						eq(word.userId, userId),
						eq(word.term, (term as string).toLowerCase().trim()),
					),
					with: { category: true },
				});

				if (!result) {
					return {
						content: [{ type: "text", text: `Word "${term}" not found` }],
						isError: true,
					};
				}

				return {
					content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
				};
			} catch (error) {
				return {
					content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
					isError: true,
				};
			}
		}
	);

	// Search Words Tool
	server.registerTool(
		"search-words",
		{
			title: "Search Vocabulary",
			description: "Search words by term or meaning",
			inputSchema: {
				query: z.string().describe("Search query"),
				limit: z.number().optional().default(10).describe("Max results"),
			},
		},
		async ({ query, limit }) => {
			try {
				const searchPattern = `%${query}%`;

				const results = await db.query.word.findMany({
					where: and(
						eq(word.userId, userId),
						or(
							ilike(word.term, searchPattern),
							ilike(word.meaning, searchPattern),
							ilike(word.notes, searchPattern),
						),
					),
					limit: (limit as number) || 10,
					with: { category: true },
				});

				return {
					content: [{ type: "text", text: JSON.stringify({ results, query }, null, 2) }],
				};
			} catch (error) {
				return {
					content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
					isError: true,
				};
			}
		}
	);

	// Remove Word Tool
	server.registerTool(
		"remove-word",
		{
			title: "Remove Word",
			description: "Remove a word from vocabulary",
			inputSchema: {
				term: z.string().describe("The word to remove"),
			},
		},
		async ({ term }) => {
			try {
				const termLower = (term as string).toLowerCase().trim();

				const deleted = await db
					.delete(word)
					.where(and(eq(word.userId, userId), eq(word.term, termLower)))
					.returning();

				if (deleted.length === 0) {
					return {
						content: [{ type: "text", text: `Word "${termLower}" not found` }],
						isError: true,
					};
				}

				return {
					content: [{ type: "text", text: JSON.stringify({ success: true, message: `Removed "${termLower}"` }, null, 2) }],
				};
			} catch (error) {
				return {
					content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
					isError: true,
				};
			}
		}
	);

	return server;
}

export async function POST(request: NextRequest) {
	const authHeader = request.headers.get("authorization");
	const token = authHeader?.replace("Bearer ", "");

	if (!token) {
		return NextResponse.json(
			{ jsonrpc: "2.0", error: { code: -32000, message: "Authorization required" }, id: null },
			{ status: 401 }
		);
	}

	const userId = await validateToken(token);
	if (!userId) {
		return NextResponse.json(
			{ jsonrpc: "2.0", error: { code: -32000, message: "Invalid token" }, id: null },
			{ status: 401 }
		);
	}

	const body = await request.json();
	const sessionId = request.headers.get("mcp-session-id");

	let transport: StreamableHTTPServerTransport;

	if (sessionId && transports[sessionId]) {
		transport = transports[sessionId];
	} else if (!sessionId && isInitializeRequest(body)) {
		transport = new StreamableHTTPServerTransport({
			sessionIdGenerator: () => randomUUID(),
			onsessioninitialized: (id) => {
				transports[id] = transport;
			},
			onsessionclosed: (id) => {
				delete transports[id];
			},
		});

		transport.onclose = () => {
			if (transport.sessionId) {
				delete transports[transport.sessionId];
			}
		};

		const server = createMcpServer(userId);
		await server.connect(transport);
	} else {
		return NextResponse.json(
			{ jsonrpc: "2.0", error: { code: -32000, message: "Invalid session" }, id: null },
			{ status: 400 }
		);
	}

	// Handle the request
	const chunks: string[] = [];
	let responseHeaders: Record<string, string> = {};

	const mockRes = {
		setHeader: (name: string, value: string) => {
			responseHeaders[name.toLowerCase()] = value;
		},
		getHeader: (name: string) => responseHeaders[name.toLowerCase()],
		write: (chunk: string) => {
			chunks.push(chunk);
			return true;
		},
		end: (chunk?: string) => {
			if (chunk) chunks.push(chunk);
		},
		on: () => mockRes,
		once: () => mockRes,
		emit: () => false,
		removeListener: () => mockRes,
		writableEnded: false,
		headersSent: false,
		flushHeaders: () => {},
	};

	const mockReq = {
		method: "POST",
		headers: Object.fromEntries(request.headers.entries()),
		body,
		on: () => mockReq,
		once: () => mockReq,
		removeListener: () => mockReq,
	};

	await transport.handleRequest(mockReq as any, mockRes as any, body);

	const responseBody = chunks.join("");
	const headers: HeadersInit = {
		"Content-Type": responseHeaders["content-type"] || "application/json",
	};

	if (responseHeaders["mcp-session-id"]) {
		headers["mcp-session-id"] = responseHeaders["mcp-session-id"];
	}

	return new NextResponse(responseBody, { headers });
}

export async function GET(request: NextRequest) {
	const sessionId = request.headers.get("mcp-session-id");

	if (!sessionId || !transports[sessionId]) {
		return NextResponse.json({ error: "Invalid session" }, { status: 400 });
	}

	// SSE streaming not fully supported in serverless - return error
	return NextResponse.json(
		{ error: "SSE streaming not available in serverless. Use stateful mode." },
		{ status: 501 }
	);
}

export async function DELETE(request: NextRequest) {
	const sessionId = request.headers.get("mcp-session-id");

	if (!sessionId || !transports[sessionId]) {
		return NextResponse.json({ error: "Invalid session" }, { status: 400 });
	}

	const transport = transports[sessionId];
	await transport.close();
	delete transports[sessionId];

	return NextResponse.json({ success: true });
}
