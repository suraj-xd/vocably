# @vocably/cli

Command-line interface for vocabulary management.

## Installation

```bash
npm install -g @vocably/cli
# or
bunx @vocably/cli add "serendipity"
```

## Setup

```bash
vocably auth login <token>
```

Get your API token from Settings > API Keys in the web dashboard. Token is stored in `~/.vocably/config.json`.

## Commands

### add

```bash
vocably add <word> [options]

Options:
  -n, --notes <notes>      Personal notes
  -c, --context <context>  Where you encountered the word
  --no-ai                  Skip AI-powered definition
```

Examples:

```bash
vocably add "serendipity"
vocably add "ephemeral" --notes "heard in a podcast"
vocably add "ubiquitous" --context "tech article" --no-ai
```

### list

```bash
vocably list [options]

Options:
  -l, --limit <number>  Number of words (default: 20)
  --category <name>     Filter by category
```

### search

```bash
vocably search <query>
```

### remove

```bash
vocably remove <word>
```

### auth

```bash
vocably auth login <token>   # Authenticate
vocably auth logout          # Remove credentials
vocably auth status          # Check status
```

### config

```bash
vocably config show  # Display configuration
vocably config path  # Show config file location
```

## Configuration

Stored in `~/.vocably/config.json`:

```json
{
  "apiUrl": "https://your-api-url",
  "token": "vocably_xxxx..."
}
```

## Development

```bash
bun run --filter @vocably/cli dev -- <command>
bun run --filter @vocably/cli dev -- add "test"
bun run --filter @vocably/cli dev -- list
```
