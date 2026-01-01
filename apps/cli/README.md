# @vocably/cli

Command-line interface for managing your English vocabulary. Built for Hindi speakers learning English.

## Installation

```bash
npm install -g @vocably/cli
```

Or run directly with npx:

```bash
npx @vocably/cli add "serendipity"
```

## Quick Start

1. Get your API token from [vocab.surajgaud.com](https://vocab.surajgaud.com) → Settings → API Keys

2. Authenticate:
```bash
vocably auth login <your-token>
```

3. Start adding words:
```bash
vocably add "ephemeral"
```

## Commands

### `vocably add <word>`

Add a new word to your vocabulary with AI-powered definitions and examples.

```bash
vocably add "serendipity"
vocably add "ephemeral" --notes "heard in a podcast"
vocably add "ubiquitous" --context "tech article" --no-ai
```

Options:
- `-n, --notes <notes>` - Personal notes about the word
- `-c, --context <context>` - Where you encountered the word
- `--no-ai` - Skip AI-powered definition enrichment

### `vocably list`

List your vocabulary words.

```bash
vocably list
vocably list --limit 50
vocably list --category "technology"
```

Options:
- `-l, --limit <number>` - Number of words to show (default: 20)
- `--category <name>` - Filter by category

### `vocably search <query>`

Search through your vocabulary.

```bash
vocably search "happy"
```

### `vocably remove <word>`

Remove a word from your vocabulary.

```bash
vocably remove "obsolete"
```

### `vocably auth`

Manage authentication.

```bash
vocably auth login <token>   # Save your API token
vocably auth logout          # Remove credentials
vocably auth status          # Check authentication status
```

### `vocably config`

View CLI configuration.

```bash
vocably config show  # Display current configuration
vocably config path  # Show config file location
```

## Aliases

Both `vocably` and `vocab` commands are available:

```bash
vocab add "word"      # Same as vocably add "word"
vocab list            # Same as vocably list
```

## Configuration

Configuration is stored in `~/.vocably/config.json`:

```json
{
  "apiUrl": "https://vocab.surajgaud.com/api",
  "token": "vocab_xxxx..."
}
```

## Requirements

- Node.js 18 or higher

## License

MIT
