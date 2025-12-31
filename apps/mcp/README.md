# @vocab/mcp

MCP (Model Context Protocol) server for the Vocab vocabulary learning system. Enables Claude and other AI assistants to interact directly with your vocabulary.

## Installation

### Claude Desktop

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "vocab": {
      "command": "npx",
      "args": ["@vocab/mcp"],
      "env": {
        "VOCAB_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

Get your API token from the Vocab web app under Settings > API Keys.

### Other MCP Clients

The server uses stdio transport and can be integrated with any MCP-compatible client:

```bash
VOCAB_API_TOKEN=your-token npx @vocab/mcp
```

## Available Tools

### add-word

Add a new vocabulary word to your collection.

Parameters:
- `term` (required) - The word to add
- `notes` (optional) - Personal notes about the word
- `context` (optional) - Where you encountered the word
- `generateAI` (optional, default: true) - Generate AI-powered definitions

### list-words

List vocabulary words with pagination.

Parameters:
- `limit` (optional, default: 20) - Number of words to return
- `offset` (optional, default: 0) - Pagination offset
- `category` (optional) - Filter by category

### search-words

Search through your vocabulary.

Parameters:
- `query` (required) - Search term

### get-word

Get details for a specific word.

Parameters:
- `term` (required) - The word to look up

### remove-word

Remove a word from your vocabulary.

Parameters:
- `term` (required) - The word to remove

## Example Usage in Claude

Once configured, you can interact naturally:

> "Add the word 'ephemeral' to my vocabulary"
> "What words do I have related to time?"
> "Show me my recent vocabulary additions"
> "Remove 'test' from my vocabulary"

## Environment Variables

- `VOCAB_API_TOKEN` (required) - Your Vocab API token
- `VOCAB_API_URL` (optional) - API URL override (default: production API)

## Development

```bash
# Run in development mode
cd apps/mcp
bun run dev

# Build for distribution
bun run build
```

## Technical Details

Built with [xmcp](https://github.com/anthropics/xmcp) for MCP server implementation. Uses stdio transport for Claude Desktop compatibility.
