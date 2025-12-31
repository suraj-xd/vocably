# @vocably/mcp

MCP server for vocabulary management with Claude Desktop.

## Installation

Add to your Claude Desktop config:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "vocably": {
      "command": "npx",
      "args": ["@vocably/mcp"],
      "env": {
        "VOCABLY_API_TOKEN": "vocably_xxx",
        "VOCABLY_API_URL": "https://your-api-url"
      }
    }
  }
}
```

Get your API token from Settings > API Keys in the web dashboard.

## Available Tools

| Tool | Description |
|------|-------------|
| `add-word` | Add a vocabulary word |
| `list-words` | List all vocabulary |
| `get-word` | Get word details by term |
| `search-words` | Search vocabulary |
| `remove-word` | Remove a word |

## Example Usage

Once configured, interact naturally with Claude:

- "Add 'perspicacious' to my vocabulary"
- "What words do I have saved?"
- "Search for words related to 'happy'"
- "Remove 'obsolete' from my list"

## Environment Variables

- `VOCABLY_API_TOKEN` (required) - Your API token
- `VOCABLY_API_URL` (optional) - API URL override

## Development

```bash
cd apps/mcp
bun run dev
bun run build
```
