import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { db } from "@vocably/db";
import { word, category, apiToken } from "@vocably/db/schema";
import { eq, desc, and, or, ilike } from "drizzle-orm";
import { generateVocabularyData, isAIAvailable } from "@vocably/api/lib/ai-service";
import { randomUUID, createHash } from "node:crypto";

// Store active transports by session ID
const transports: Record<string, StreamableHTTPServerTransport> = {};

// Validate API token and get user ID (same logic as context.ts)
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

	// Check expiration
	if (tokenRecord.expiresAt && tokenRecord.expiresAt < new Date()) {
		return null;
	}

	// Update last used timestamp
	await db
		.update(apiToken)
		.set({ lastUsedAt: new Date() })
		.where(eq(apiToken.id, tokenRecord.id));

	return tokenRecord.userId;
}

// Background AI generation - fire and forget
async function generateAIInBackground(
	wordId: string,
	term: string,
	userId: string,
	context?: string,
) {
	try {
		await db
			.update(word)
			.set({ aiStatus: "generating" })
			.where(eq(word.id, wordId));

		const result = await generateVocabularyData(term, userId, context);

		if (result) {
			let categoryId: string | undefined;
			if (result.data.category) {
				const existingCategory = await db.query.category.findFirst({
					where: and(
						eq(category.userId, userId),
						eq(category.name, result.data.category.toLowerCase()),
					),
				});

				if (existingCategory) {
					categoryId = existingCategory.id;
				} else {
					const [newCategory] = await db
						.insert(category)
						.values({
							userId,
							name: result.data.category.toLowerCase(),
						})
						.returning();
					if (newCategory) {
						categoryId = newCategory.id;
					}
				}
			}

			await db
				.update(word)
				.set({
					meaning: result.data.meaning,
					partOfSpeech: result.data.partOfSpeech,
					pronunciation: result.data.pronunciation,
					memorableExplanation: result.data.memorableExplanation,
					hindiTranslation: result.data.hindiTranslation,
					hindiContext: result.data.hindiContext,
					usageExamples: result.data.usageExamples,
					synonyms: result.data.synonyms,
					antonyms: result.data.antonyms,
					difficulty: result.data.difficulty,
					categoryId,
					aiGenerated: true,
					aiProvider: result.provider,
					aiStatus: "complete",
					aiError: null,
				})
				.where(eq(word.id, wordId));
		} else {
			await db
				.update(word)
				.set({
					aiStatus: "error",
					aiError: "AI generation returned no result",
				})
				.where(eq(word.id, wordId));
		}
	} catch (error) {
		console.error("Background AI generation failed:", error);
		await db
			.update(word)
			.set({
				aiStatus: "error",
				aiError: error instanceof Error ? error.message : "AI generation failed",
			})
			.where(eq(word.id, wordId));
	}
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
			description: "Add a new vocabulary word to your collection. Optionally generates AI-powered definitions, examples, and related data.",
			inputSchema: {
				term: z.string().describe("The vocabulary word to add"),
				notes: z.string().optional().describe("Personal notes about the word"),
				context: z.string().optional().describe("Where you encountered the word"),
				generateAI: z.boolean().optional().default(true).describe("Generate AI-powered definition"),
			},
		},
		async ({ term, notes, context, generateAI }) => {
			try {
				const termLower = term.toLowerCase().trim();

				// Check if word already exists
				const existing = await db.query.word.findFirst({
					where: and(eq(word.userId, userId), eq(word.term, termLower)),
				});

				if (existing) {
					return {
						content: [{ type: "text", text: `Word "${termLower}" already exists in your vocabulary` }],
						isError: true,
					};
				}

				const shouldGenerateAI = generateAI !== false && (await isAIAvailable(userId));

				const [newWord] = await db
					.insert(word)
					.values({
						userId,
						term: termLower,
						notes,
						context,
						source: "mcp",
						aiStatus: shouldGenerateAI ? "pending" : "idle",
					})
					.returning();

				if (shouldGenerateAI && newWord) {
					generateAIInBackground(newWord.id, termLower, userId, context).catch(
						(err) => console.error("Background AI generation error:", err),
					);
				}

				return {
					content: [{ type: "text", text: JSON.stringify({ success: true, message: `Added "${termLower}" to your vocabulary`, word: newWord }, null, 2) }],
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
			description: "List all vocabulary words in your collection",
			inputSchema: {
				limit: z.number().optional().default(20).describe("Maximum number of words to return"),
				category: z.string().optional().describe("Filter by category"),
			},
		},
		async ({ limit, category: categoryFilter }) => {
			try {
				let whereClause = eq(word.userId, userId);

				if (categoryFilter) {
					const cat = await db.query.category.findFirst({
						where: and(eq(category.userId, userId), eq(category.name, categoryFilter)),
					});
					if (cat) {
						whereClause = and(eq(word.userId, userId), eq(word.categoryId, cat.id))!;
					}
				}

				const words = await db.query.word.findMany({
					where: whereClause,
					limit: limit || 20,
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
			description: "Get detailed information about a specific vocabulary word including definition, examples, and related words",
			inputSchema: {
				term: z.string().describe("The vocabulary word to get details for"),
			},
		},
		async ({ term }) => {
			try {
				const result = await db.query.word.findFirst({
					where: and(
						eq(word.userId, userId),
						eq(word.term, term.toLowerCase().trim()),
					),
					with: {
						category: true,
						outgoingRelationships: {
							with: { targetWord: true },
						},
					},
				});

				if (!result) {
					return {
						content: [{ type: "text", text: `Word "${term}" not found in your vocabulary` }],
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
			description: "Search vocabulary words by term, meaning, or notes",
			inputSchema: {
				query: z.string().describe("Search query to find vocabulary words"),
				limit: z.number().optional().default(10).describe("Maximum number of results"),
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
							ilike(word.memorableExplanation, searchPattern),
						),
					),
					limit: limit || 10,
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
			description: "Remove a vocabulary word from your collection",
			inputSchema: {
				term: z.string().describe("The vocabulary word to remove"),
			},
		},
		async ({ term }) => {
			try {
				const termLower = term.toLowerCase().trim();

				const deleted = await db
					.delete(word)
					.where(and(eq(word.userId, userId), eq(word.term, termLower)))
					.returning();

				if (deleted.length === 0) {
					return {
						content: [{ type: "text", text: `Word "${termLower}" not found in your vocabulary` }],
						isError: true,
					};
				}

				return {
					content: [{ type: "text", text: JSON.stringify({ success: true, message: `Removed "${termLower}" from your vocabulary` }, null, 2) }],
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

// Handle MCP requests (POST /mcp)
export async function handleMcpPost(
	req: Request,
): Promise<Response> {
	// Get authorization token
	const authHeader = req.headers.get("authorization");
	const token = authHeader?.replace("Bearer ", "");

	if (!token) {
		return new Response(
			JSON.stringify({
				jsonrpc: "2.0",
				error: { code: -32000, message: "Authorization header required" },
				id: null,
			}),
			{ status: 401, headers: { "Content-Type": "application/json" } }
		);
	}

	const userId = await validateToken(token);
	if (!userId) {
		return new Response(
			JSON.stringify({
				jsonrpc: "2.0",
				error: { code: -32000, message: "Invalid or expired API token" },
				id: null,
			}),
			{ status: 401, headers: { "Content-Type": "application/json" } }
		);
	}

	const body = await req.json();
	const sessionId = req.headers.get("mcp-session-id");

	let transport: StreamableHTTPServerTransport;

	if (sessionId && transports[sessionId]) {
		// Reuse existing session
		transport = transports[sessionId];
	} else if (!sessionId && isInitializeRequest(body)) {
		// New session initialization
		transport = new StreamableHTTPServerTransport({
			sessionIdGenerator: () => randomUUID(),
			onsessioninitialized: (id) => {
				transports[id] = transport;
				console.log("MCP session initialized:", id);
			},
			onsessionclosed: (id) => {
				delete transports[id];
				console.log("MCP session closed:", id);
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
		return new Response(
			JSON.stringify({
				jsonrpc: "2.0",
				error: { code: -32000, message: "Invalid session. Send initialize request first." },
				id: null,
			}),
			{ status: 400, headers: { "Content-Type": "application/json" } }
		);
	}

	// Create a mock Express-like response object for the transport
	const chunks: Uint8Array[] = [];
	let statusCode = 200;
	const headers: Record<string, string> = {};

	const mockRes = {
		statusCode,
		setHeader: (name: string, value: string) => {
			headers[name.toLowerCase()] = value;
		},
		getHeader: (name: string) => headers[name.toLowerCase()],
		write: (chunk: string | Uint8Array) => {
			if (typeof chunk === "string") {
				chunks.push(new TextEncoder().encode(chunk));
			} else {
				chunks.push(chunk);
			}
			return true;
		},
		end: (chunk?: string | Uint8Array) => {
			if (chunk) {
				if (typeof chunk === "string") {
					chunks.push(new TextEncoder().encode(chunk));
				} else {
					chunks.push(chunk);
				}
			}
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
		method: req.method,
		headers: Object.fromEntries(req.headers.entries()),
		body,
		on: () => mockReq,
		once: () => mockReq,
		removeListener: () => mockReq,
	};

	await transport.handleRequest(mockReq as any, mockRes as any, body);

	// Combine chunks into final response
	const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
	const result = new Uint8Array(totalLength);
	let offset = 0;
	for (const chunk of chunks) {
		result.set(chunk, offset);
		offset += chunk.length;
	}

	return new Response(result, {
		status: statusCode,
		headers: {
			"Content-Type": headers["content-type"] || "application/json",
			...(headers["mcp-session-id"] && { "mcp-session-id": headers["mcp-session-id"] }),
		},
	});
}

// Handle MCP SSE stream (GET /mcp)
export async function handleMcpGet(req: Request): Promise<Response> {
	const sessionId = req.headers.get("mcp-session-id");

	if (!sessionId || !transports[sessionId]) {
		return new Response(
			JSON.stringify({ error: "Invalid or missing session ID" }),
			{ status: 400, headers: { "Content-Type": "application/json" } }
		);
	}

	const transport = transports[sessionId];

	// Create SSE stream
	const stream = new ReadableStream({
		start(controller) {
			const encoder = new TextEncoder();

			const mockRes = {
				setHeader: () => {},
				getHeader: () => undefined,
				write: (chunk: string) => {
					controller.enqueue(encoder.encode(chunk));
					return true;
				},
				end: () => {
					controller.close();
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
				method: "GET",
				headers: Object.fromEntries(req.headers.entries()),
				on: () => mockReq,
				once: () => mockReq,
				removeListener: () => mockReq,
			};

			transport.handleRequest(mockReq as any, mockRes as any).catch((err) => {
				console.error("SSE error:", err);
				controller.close();
			});
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			"Connection": "keep-alive",
		},
	});
}

// Handle MCP session close (DELETE /mcp)
export async function handleMcpDelete(req: Request): Promise<Response> {
	const sessionId = req.headers.get("mcp-session-id");

	if (!sessionId || !transports[sessionId]) {
		return new Response(
			JSON.stringify({ error: "Invalid or missing session ID" }),
			{ status: 400, headers: { "Content-Type": "application/json" } }
		);
	}

	const transport = transports[sessionId];
	await transport.close();
	delete transports[sessionId];

	return new Response(JSON.stringify({ success: true }), {
		headers: { "Content-Type": "application/json" },
	});
}
