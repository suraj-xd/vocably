# Vocably - Vocabulary Management System

A vocabulary learning system for Hindi speakers learning English, with web app, CLI, and MCP server.

## Project Structure

```
vocably/
├── apps/
│   ├── web/        # Next.js web application (port 3001)
│   ├── server/     # Elysia API server (port 3000)
│   ├── cli/        # @vocably/cli - Terminal commands
│   └── mcp/        # @vocably/mcp - MCP server for Claude
├── packages/
│   ├── api/        # oRPC routers and procedures
│   ├── auth/       # Better-Auth configuration
│   ├── db/         # Drizzle ORM schemas
│   ├── env/        # Environment variable validation
│   └── config/     # Shared TypeScript config
```

## Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS, shadcn/ui
- **Backend**: Elysia, oRPC
- **Database**: Supabase (PostgreSQL), Drizzle ORM
- **Auth**: Better-Auth (session) + API Tokens (CLI/MCP)
- **AI**: Vercel AI SDK with user-provided API keys
- **Monorepo**: Turborepo, Bun

## Key Design Decisions

### Authentication
- **Web**: Better-Auth with email/password + OAuth
- **CLI/MCP**: API tokens (`vocab_xxxx` or `vocably_xxxx`) validated server-side

### Database Schema
- `word` - Vocabulary words with AI-generated data
- `category` - AI-generated categories (freely created)
- `word_relationship` - For future graph visualization
- `api_token` - CLI/MCP authentication
- `user_settings` - AI provider configuration

### UI Design
- Minimalist, Vercel-like aesthetic
- JetBrains Mono font throughout
- 0px border radius (sharp edges)
- True black dark theme

## Development Commands

```bash
# Start all services
bun run dev

# Individual services
bun run dev:web      # Frontend on :3001
bun run dev:server   # Backend on :3000

# Database
bun run db:push      # Apply schema changes
bun run db:studio    # Open Drizzle Studio

# CLI (local development)
bun run --filter @vocably/cli dev -- add "serendipity"
```

## API Routes

### Words
- `words.list` - List vocabulary (paginated)
- `words.get` - Get word by ID
- `words.getByTerm` - Get word by term
- `words.add` - Add new word
- `words.update` - Update word notes
- `words.remove` - Remove word
- `words.search` - Search vocabulary
- `words.getGraphData` - Get graph data for visualization

### API Tokens
- `apiTokens.list` - List user's tokens
- `apiTokens.create` - Create new token
- `apiTokens.revoke` - Revoke token
- `apiTokens.delete` - Delete token

## File Patterns

### Adding a new API route
1. Create router in `packages/api/src/routers/`
2. Add to `packages/api/src/routers/index.ts`
3. Use `protectedProcedure` for auth-required endpoints

### Adding a database table
1. Create schema in `packages/db/src/schema/`
2. Export from `packages/db/src/schema/index.ts`
3. Run `bun run db:push` to apply changes

### Adding a CLI command
1. Create command in `apps/cli/src/commands/`
2. Add to `apps/cli/bin/vocab.ts`

### Adding an MCP tool
1. Create tool in `apps/mcp/src/tools/`
2. XMCP auto-discovers tools from the directory

## Code Style

- Biome for linting/formatting
- Tabs for indentation
- Double quotes for strings
- Semicolons always
