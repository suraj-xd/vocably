import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

// Store active transports by session ID
const transports: Record<string, { transport: StreamableHTTPServerTransport; token: string }> = {};

// Call the API server
async function apiRequest<T>(endpoint: string, token: string, body?: Record<string, unknown>): Promise<T> {
	const response = await fetch(`${API_URL}${endpoint}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: body ? JSON.stringify({ json: body }) : undefined,
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	const result = await response.json();
	return result.json;
}

// Create MCP server with tools
function createMcpServer(token: string): McpServer {
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
				const result = await apiRequest("/rpc/words/add", token, {
					term: term as string,
					notes: notes as string | undefined,
					context: context as string | undefined,
					source: "mcp",
				});

				return {
					content: [
						{
							type: "text",
							text: JSON.stringify({ success: true, message: `Added "${term}"`, word: result }, null, 2),
						},
					],
				};
			} catch (error) {
				return {
					content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
					isError: true,
				};
			}
		},
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
				const result = await apiRequest("/rpc/words/list", token, {
					limit: (limit as number) || 20,
				});

				return {
					content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
				};
			} catch (error) {
				return {
					content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
					isError: true,
				};
			}
		},
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
				const result = await apiRequest("/rpc/words/getByTerm", token, {
					term: term as string,
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
		},
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
				const result = await apiRequest("/rpc/words/search", token, {
					query: query as string,
					limit: (limit as number) || 10,
				});

				return {
					content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
				};
			} catch (error) {
				return {
					content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
					isError: true,
				};
			}
		},
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
				await apiRequest("/rpc/words/remove", token, {
					term: term as string,
				});

				return {
					content: [{ type: "text", text: JSON.stringify({ success: true, message: `Removed "${term}"` }, null, 2) }],
				};
			} catch (error) {
				return {
					content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
					isError: true,
				};
			}
		},
	);

	return server;
}

export async function POST(request: NextRequest) {
	const authHeader = request.headers.get("authorization");
	const token = authHeader?.replace("Bearer ", "");

	if (!token) {
		return NextResponse.json(
			{ jsonrpc: "2.0", error: { code: -32000, message: "Authorization required. Pass your API token in the Authorization header." }, id: null },
			{ status: 401 },
		);
	}

	const body = await request.json();
	const sessionId = request.headers.get("mcp-session-id");

	let transport: StreamableHTTPServerTransport;

	if (sessionId && transports[sessionId]) {
		transport = transports[sessionId].transport;
	} else if (!sessionId && isInitializeRequest(body)) {
		transport = new StreamableHTTPServerTransport({
			sessionIdGenerator: () => randomUUID(),
			onsessioninitialized: (id) => {
				transports[id] = { transport, token };
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

		const server = createMcpServer(token);
		await server.connect(transport);
	} else {
		return NextResponse.json(
			{ jsonrpc: "2.0", error: { code: -32000, message: "Invalid session" }, id: null },
			{ status: 400 },
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

	// biome-ignore lint/suspicious/noExplicitAny: MCP SDK types don't match Next.js types
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

	return NextResponse.json({ error: "SSE not supported in serverless" }, { status: 501 });
}

export async function DELETE(request: NextRequest) {
	const sessionId = request.headers.get("mcp-session-id");

	if (!sessionId || !transports[sessionId]) {
		return NextResponse.json({ error: "Invalid session" }, { status: 400 });
	}

	const { transport } = transports[sessionId];
	await transport.close();
	delete transports[sessionId];

	return NextResponse.json({ success: true });
}
