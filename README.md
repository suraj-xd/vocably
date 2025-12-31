# Vocab

A vocabulary learning system for Hindi speakers learning English. Access your vocabulary from the web, terminal, or directly through Claude.

## Overview

Vocab provides three interfaces to manage your vocabulary:

- **Web App** - Browser-based dashboard with visual progress tracking
- **CLI** - Terminal-first workflow for quick additions
- **MCP Server** - AI-native interface that works directly with Claude

All interfaces sync to the same backend, so your vocabulary is always up to date.

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) v1.3+
- PostgreSQL database (or Supabase)

### Installation

```bash
git clone <repo-url>
cd vocab
bun install
```

### Environment Setup

```bash
cp .env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
```

Configure `apps/server/.env`:

```env
DATABASE_URL="your-supabase-pooler-url"
BETTER_AUTH_SECRET="generate-32-char-secret"
BETTER_AUTH_URL="http://localhost:3000"
CORS_ORIGIN="http://localhost:3001"
```

Configure `apps/web/.env`:

```env
NEXT_PUBLIC_SERVER_URL="http://localhost:3000"
```

### Run

```bash
bun run db:push   # Apply schema
bun run dev       # Start servers
```

- Web: http://localhost:3001
- API: http://localhost:3000

## CLI

```bash
# Authenticate
vocab auth login

# Usage
vocab add "serendipity"
vocab add "ephemeral" --context "From a poem"
vocab list
vocab search "luck"
vocab remove "serendipity"
```

See [apps/cli/README.md](apps/cli/README.md) for full documentation.

## MCP Server

Add to Claude Desktop config:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "vocab": {
      "command": "npx",
      "args": ["@vocab/mcp"],
      "env": {
        "VOCAB_API_TOKEN": "vocab_xxx"
      }
    }
  }
}
```

Get your API token from Settings > API Keys in the web app.

See [apps/mcp/README.md](apps/mcp/README.md) for full documentation.

## Project Structure

```
vocab/
├── apps/
│   ├── web/      # Next.js frontend
│   ├── server/   # Elysia API
│   ├── cli/      # Terminal client
│   └── mcp/      # Claude MCP server
└── packages/
    ├── api/      # oRPC routers
    ├── auth/     # Better-Auth config
    ├── db/       # Drizzle schemas
    └── env/      # Environment validation
```

## Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS, shadcn/ui
- **Backend**: Elysia, oRPC
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Better-Auth (web) + API tokens (CLI/MCP)
- **AI**: Vercel AI SDK with user-provided keys
- **Monorepo**: Turborepo, Bun

## Scripts

```bash
bun run dev          # All services
bun run dev:web      # Web only
bun run dev:server   # API only
bun run db:push      # Apply schema
bun run db:studio    # Database GUI
bun run build        # Production build
bun run check-types  # Type checking
```

## License

MIT
