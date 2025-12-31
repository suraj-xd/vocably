# Vocab

A comprehensive vocabulary learning system for Hindi speakers learning English, with web app, CLI, and MCP server.

## Features

- **Web App** - Beautiful vocabulary dashboard with word cards, search, and detailed word views
- **CLI** - Terminal commands for quick vocabulary management
- **MCP Server** - Claude integration for adding words while chatting
- **AI-Powered** - Automatic definition generation with memorable explanations for Hindi speakers
- **Graph-Ready** - Word relationships stored for future Obsidian-like visualization

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TailwindCSS, shadcn/ui |
| Backend | Elysia, oRPC |
| Database | Supabase (PostgreSQL), Drizzle ORM |
| Auth | Better-Auth (web) + API Tokens (CLI/MCP) |
| AI | Vercel AI SDK (OpenAI, Anthropic, Google) |
| Monorepo | Turborepo, Bun |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.1+ installed
- [Supabase](https://supabase.com) account (free tier works)
- Node.js 20+ (for some tooling)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd vocab
bun install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be ready
3. Go to **Settings** → **Database** → **Connection string** → **URI**
4. Copy the connection string (use "Transaction" mode for Drizzle)

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example apps/server/.env
```

Edit `apps/server/.env` with your values:

```env
# Database (from Supabase)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Auth (generate a random 32+ char secret)
BETTER_AUTH_SECRET="your-super-secret-key-at-least-32-chars"
BETTER_AUTH_URL="http://localhost:3000"

# API Key Encryption (generate a random 32 char string)
API_KEY_ENCRYPTION_SECRET="another-32-char-secret-for-keys"

# CORS
CORS_ORIGIN="http://localhost:3001"
```

For the web app, edit `apps/web/.env.local`:

```env
NEXT_PUBLIC_SERVER_URL="http://localhost:3000"
```

### 4. Push Database Schema

```bash
bun run db:push
```

This creates all required tables: `user`, `session`, `word`, `category`, `api_token`, etc.

### 5. Start Development Servers

```bash
bun run dev
```

This starts both:
- **Web App** → [http://localhost:3001](http://localhost:3001)
- **API Server** → [http://localhost:3000](http://localhost:3000)

### 6. Create Your Account

1. Open [http://localhost:3001](http://localhost:3001)
2. Click **Sign Up** and create an account with email/password
3. You'll be redirected to your vocabulary dashboard

---

## Using the Web App

### Dashboard

The main dashboard shows all your vocabulary words in a grid. Each card displays:
- Word term and pronunciation
- Part of speech and category
- Brief definition

Click any word to see its full details including:
- Complete definition
- Memorable explanation (tailored for Hindi speakers)
- Hindi translation and context
- Usage examples
- Synonyms and antonyms
- Related words

### Adding Words

Click the **+ Add Word** button to add new vocabulary:
1. Enter the word
2. Optionally add notes or context (where you found it)
3. Toggle AI generation on/off
4. Click Add

If AI is enabled, the word is enriched with definition, examples, and Hindi context.

### Search

Use the search bar to find words in your vocabulary. Search matches against:
- Word term
- Definition
- Notes
- Examples

### Settings

Access settings via the gear icon to:
- View account info
- Manage API keys (for CLI/MCP)
- Configure AI provider

---

## Setting Up the CLI

The CLI lets you manage vocabulary from your terminal.

### 1. Create an API Key

1. Go to **Settings** → **API Keys** in the web app
2. Click **Create Key**
3. Name it (e.g., "CLI")
4. Copy the token (starts with `vocab_`)

### 2. Configure the CLI

```bash
# From the project root
cd apps/cli

# Login with your API key
bun run dev -- auth login
# Paste your API key when prompted
```

Your token is saved to `~/.vocab/config.json`.

### 3. CLI Commands

```bash
# Add a word (with AI generation)
bun run dev -- add "serendipity"

# Add word with context
bun run dev -- add "ephemeral" --context "Found in a poem about cherry blossoms"

# List all words
bun run dev -- list

# Search vocabulary
bun run dev -- search "happi"

# Remove a word
bun run dev -- remove "serendipity"

# Check auth status
bun run dev -- auth status

# View/edit config
bun run dev -- config
```

### Global Installation (Optional)

To use `vocab` globally:

```bash
cd apps/cli
bun link
```

Then use anywhere:
```bash
vocab add "ubiquitous"
vocab list
```

---

## Setting Up the MCP Server

The MCP server lets Claude add words to your vocabulary during conversations.

### 1. Create an API Key

Same as CLI - create a key named "MCP" in Settings → API Keys.

### 2. Configure Claude Desktop

Edit your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Add the vocab MCP server:

```json
{
  "mcpServers": {
    "vocab": {
      "command": "bun",
      "args": ["run", "/path/to/vocab/apps/mcp/src/index.ts"],
      "env": {
        "VOCAB_API_TOKEN": "vocab_your_token_here",
        "VOCAB_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

Replace `/path/to/vocab` with your actual project path.

### 3. Restart Claude Desktop

After adding the config, restart Claude Desktop. You should see "vocab" in the MCP servers list.

### 4. MCP Tools Available

Once connected, Claude can use these tools:

| Tool | Description |
|------|-------------|
| `add-word` | Add a vocabulary word |
| `list-words` | List all vocabulary |
| `get-word` | Get word details |
| `search-words` | Search vocabulary |
| `remove-word` | Remove a word |

Example conversation:
> "Hey Claude, add 'perspicacious' to my vocabulary"
>
> Claude uses the `add-word` tool and responds with the generated definition.

---

## Project Structure

```
vocab/
├── apps/
│   ├── web/           # Next.js web application (port 3001)
│   ├── server/        # Elysia API server (port 3000)
│   ├── cli/           # @vocab/cli - Terminal commands
│   └── mcp/           # @vocab/mcp - MCP server for Claude
├── packages/
│   ├── api/           # oRPC routers and procedures
│   ├── auth/          # Better-Auth configuration
│   ├── db/            # Drizzle ORM schemas
│   ├── env/           # Environment variable validation
│   └── config/        # Shared TypeScript config
```

---

## API Reference

### Words

| Endpoint | Description |
|----------|-------------|
| `words.list` | List vocabulary (paginated) |
| `words.get` | Get word by ID |
| `words.getByTerm` | Get word by term |
| `words.add` | Add new word |
| `words.update` | Update word notes |
| `words.remove` | Remove word |
| `words.search` | Search vocabulary |
| `words.getGraphData` | Get graph visualization data |

### API Tokens

| Endpoint | Description |
|----------|-------------|
| `apiTokens.list` | List user's tokens |
| `apiTokens.create` | Create new token |
| `apiTokens.revoke` | Revoke (deactivate) token |
| `apiTokens.delete` | Delete token |

### Authentication

- **Web App**: Session-based auth via Better-Auth cookies
- **CLI/MCP**: Bearer token auth with `Authorization: Bearer vocab_xxx`

---

## Available Scripts

```bash
# Development
bun run dev           # Start all services
bun run dev:web       # Start web app only
bun run dev:server    # Start API server only

# Database
bun run db:push       # Apply schema changes
bun run db:studio     # Open Drizzle Studio GUI

# Build
bun run build         # Build all applications
bun run check-types   # TypeScript type checking

# CLI (development)
bun run --filter @vocab/cli dev -- <command>
```

---

## Environment Variables

### Server (`apps/server/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `BETTER_AUTH_SECRET` | Auth encryption secret (32+ chars) | Yes |
| `BETTER_AUTH_URL` | Server URL for auth | Yes |
| `API_KEY_ENCRYPTION_SECRET` | Encryption key for API keys (32 chars) | Yes |
| `CORS_ORIGIN` | Allowed CORS origin | Yes |

### Web (`apps/web/.env.local`)

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SERVER_URL` | API server URL | Yes |

### CLI (`~/.vocab/config.json`)

```json
{
  "token": "vocab_xxx",
  "apiUrl": "http://localhost:3000"
}
```

### MCP (environment)

| Variable | Description |
|----------|-------------|
| `VOCAB_API_TOKEN` | API token for authentication |
| `VOCAB_API_URL` | API server URL |

---

## Troubleshooting

### "Failed to connect to database"

- Check your `DATABASE_URL` is correct
- Ensure you're using the Transaction/Session pooler URL from Supabase
- Make sure `?pgbouncer=true` is in the URL

### "Unauthorized" errors in CLI/MCP

- Check your API token is correct
- Verify the token hasn't been revoked in Settings
- Ensure `VOCAB_API_URL` points to your running server

### MCP not showing in Claude

- Verify the config file path is correct for your OS
- Check the `command` path points to your bun installation
- Restart Claude Desktop after config changes
- Check Claude's MCP logs for errors

### Web app not loading

- Ensure both web and server are running (`bun run dev`)
- Check `NEXT_PUBLIC_SERVER_URL` matches your server URL
- Clear browser cache and try again

---

## Future Roadmap

- [ ] **Graph Visualization** - Obsidian-like word relationship graph
- [ ] **Spaced Repetition** - Flashcard-based review system
- [ ] **Import/Export** - CSV, Anki deck support
- [ ] **Mobile App** - React Native companion
- [ ] **Browser Extension** - Add words while reading
- [ ] **Multi-language** - Support for other target languages

---

## License

MIT
