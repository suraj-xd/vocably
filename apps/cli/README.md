# @vocab/cli

Command-line interface for the Vocab vocabulary learning system.

## Installation

```bash
# Global installation (when published)
npm install -g @vocab/cli

# Or run directly with npx
npx @vocab/cli add "serendipity"
```

## Setup

Before using the CLI, authenticate with your Vocab account:

```bash
vocab auth login
```

This opens a browser window to generate an API token. The token is stored locally in `~/.vocab/config.json`.

## Commands

### add

Add a new vocabulary word.

```bash
vocab add <word> [options]

Options:
  -n, --notes <notes>      Personal notes about the word
  -c, --context <context>  Where you encountered the word
  --no-ai                  Skip AI-powered definition generation
```

Examples:

```bash
vocab add "serendipity"
vocab add "ephemeral" --notes "heard in a podcast"
vocab add "ubiquitous" --context "tech article" --no-ai
```

### list

List your vocabulary words.

```bash
vocab list [options]

Options:
  -l, --limit <number>  Number of words to show (default: 20)
  --category <name>     Filter by category
```

### search

Search your vocabulary.

```bash
vocab search <query>
```

### remove

Remove a word from your vocabulary.

```bash
vocab remove <word>
```

### auth

Manage authentication.

```bash
vocab auth login   # Authenticate with your account
vocab auth logout  # Remove stored credentials
vocab auth status  # Check authentication status
```

### config

View and manage configuration.

```bash
vocab config show  # Display current configuration
vocab config path  # Show config file location
```

## Configuration

Configuration is stored in `~/.vocab/config.json`:

```json
{
  "apiUrl": "https://api.vocab.app",
  "apiToken": "vocab_xxxx..."
}
```

## Development

```bash
# From monorepo root
bun run --filter @vocab/cli dev -- <command>

# Examples
bun run --filter @vocab/cli dev -- add "test"
bun run --filter @vocab/cli dev -- list
```
