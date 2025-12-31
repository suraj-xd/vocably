# Vocably

Vocabulary management system for Hindi speakers learning English.

## Overview

Web app, CLI, and MCP server for building and reviewing vocabulary with AI-powered definitions.

**Stack:** Next.js 16, Elysia, oRPC, Supabase, Drizzle ORM, Vercel AI SDK

## Quick Start

```bash
git clone https://github.com/suraj-xd/vocably.git
cd vocably
bun install
```

### Environment Setup

```bash
# Copy example files
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
# Install globally
cd apps/cli && bun link

# Authenticate
vocab auth login

# Usage
vocab add "serendipity"
vocab add "ephemeral" --context "From a poem"
vocab list
vocab search "happi"
vocab remove "serendipity"
```

## MCP Server

Add to Claude Desktop config:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "vocab": {
      "command": "bun",
      "args": ["run", "/path/to/vocably/apps/mcp/src/index.ts"],
      "env": {
        "VOCAB_API_TOKEN": "vocab_xxx",
        "VOCAB_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

Get your API token from Settings > API Keys in the web app.

## Project Structure

```
vocably/
├── apps/
│   ├── web/      # Next.js frontend
│   ├── server/   # Elysia API
│   ├── cli/      # Terminal client
│   └── mcp/      # Claude MCP server
└── packages/
    ├── api/      # oRPC routers
    ├── auth/     # Better-Auth config
    └── db/       # Drizzle schemas
```

## Scripts

```bash
bun run dev          # All services
bun run dev:web      # Web only
bun run dev:server   # API only
bun run db:push      # Apply schema
bun run db:studio    # Database GUI
bun run build        # Production build
```

## License

MIT
