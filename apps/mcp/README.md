# @vocably/mcp

MCP server for vocabulary management with Claude Desktop.

## Remote MCP Server (Recommended)

The MCP server is hosted at your API server URL. Configure Claude Desktop to use it:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "vocably": {
      "url": "https://your-api-url/mcp",
      "headers": {
        "Authorization": "Bearer vocably_your_token_here"
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

## Local Installation (Alternative)

If you prefer running the MCP server locally:

```bash
npm install -g @vocably/mcp
```

Add to Claude Desktop config:

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
