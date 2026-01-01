import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

// Tool definitions
const TOOLS = [
	{
		name: "add-word",
		description: "Add a new vocabulary word to your collection",
		inputSchema: {
			type: "object",
			properties: {
				term: { type: "string", description: "The vocabulary word to add" },
				notes: { type: "string", description: "Personal notes about the word" },
				context: { type: "string", description: "Where you encountered the word" },
			},
			required: ["term"],
		},
	},
	{
		name: "list-words",
		description: "List all vocabulary words",
		inputSchema: {
			type: "object",
			properties: {
				limit: { type: "number", description: "Maximum number of words", default: 20 },
			},
		},
	},
	{
		name: "get-word",
		description: "Get details about a specific word",
		inputSchema: {
			type: "object",
			properties: {
				term: { type: "string", description: "The word to look up" },
			},
			required: ["term"],
		},
	},
	{
		name: "search-words",
		description: "Search words by term or meaning",
		inputSchema: {
			type: "object",
			properties: {
				query: { type: "string", description: "Search query" },
				limit: { type: "number", description: "Max results", default: 10 },
			},
			required: ["query"],
		},
	},
	{
		name: "remove-word",
		description: "Remove a word from vocabulary",
		inputSchema: {
			type: "object",
			properties: {
				term: { type: "string", description: "The word to remove" },
			},
			required: ["term"],
		},
	},
];

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

// Execute a tool
async function executeTool(name: string, args: Record<string, unknown>, token: string) {
	switch (name) {
		case "add-word": {
			const result = await apiRequest("/rpc/words/add", token, {
				term: args.term,
				notes: args.notes,
				context: args.context,
				source: "mcp",
			});
			return { success: true, message: `Added "${args.term}"`, word: result };
		}
		case "list-words": {
			return await apiRequest("/rpc/words/list", token, {
				limit: args.limit || 20,
			});
		}
		case "get-word": {
			const result = await apiRequest("/rpc/words/getByTerm", token, {
				term: args.term,
			});
			if (!result) throw new Error(`Word "${args.term}" not found`);
			return result;
		}
		case "search-words": {
			return await apiRequest("/rpc/words/search", token, {
				query: args.query,
				limit: args.limit || 10,
			});
		}
		case "remove-word": {
			await apiRequest("/rpc/words/remove", token, { term: args.term });
			return { success: true, message: `Removed "${args.term}"` };
		}
		default:
			throw new Error(`Unknown tool: ${name}`);
	}
}

// Handle JSON-RPC request
function handleRequest(method: string, params: unknown, id: unknown, token: string): Promise<unknown> | unknown {
	switch (method) {
		case "initialize":
			return {
				jsonrpc: "2.0",
				id,
				result: {
					protocolVersion: "2024-11-05",
					capabilities: { tools: {} },
					serverInfo: { name: "vocably", version: "1.0.0" },
				},
			};

		case "notifications/initialized":
			return null; // Notification, no response

		case "tools/list":
			return {
				jsonrpc: "2.0",
				id,
				result: { tools: TOOLS },
			};

		case "tools/call":
			return (async () => {
				const { name, arguments: args } = params as { name: string; arguments: Record<string, unknown> };
				try {
					const result = await executeTool(name, args || {}, token);
					return {
						jsonrpc: "2.0",
						id,
						result: {
							content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
						},
					};
				} catch (error) {
					return {
						jsonrpc: "2.0",
						id,
						result: {
							content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
							isError: true,
						},
					};
				}
			})();

		default:
			return {
				jsonrpc: "2.0",
				id,
				error: { code: -32601, message: `Method not found: ${method}` },
			};
	}
}

export async function POST(request: NextRequest) {
	try {
		const authHeader = request.headers.get("authorization");
		const token = authHeader?.replace("Bearer ", "");

		if (!token) {
			return NextResponse.json(
				{ jsonrpc: "2.0", error: { code: -32000, message: "Authorization required" }, id: null },
				{ status: 401 },
			);
		}

		const body = await request.json();

		// Handle batch requests
		if (Array.isArray(body)) {
			const responses = await Promise.all(
				body.map(async (req) => {
					const result = handleRequest(req.method, req.params, req.id, token);
					return result instanceof Promise ? await result : result;
				})
			);
			return NextResponse.json(responses.filter(Boolean));
		}

		// Handle single request
		const response = handleRequest(body.method, body.params, body.id, token);
		const result = response instanceof Promise ? await response : response;

		if (result === null) {
			return new NextResponse(null, { status: 204 });
		}

		return NextResponse.json(result);
	} catch (error) {
		console.error("MCP Error:", error);
		return NextResponse.json(
			{ jsonrpc: "2.0", error: { code: -32603, message: error instanceof Error ? error.message : "Internal error" }, id: null },
			{ status: 500 },
		);
	}
}

export async function GET() {
	return NextResponse.json({ error: "Use POST for JSON-RPC requests" }, { status: 400 });
}

export async function DELETE() {
	return NextResponse.json({ success: true });
}
