# @vocab/web

Next.js web application for the Vocab vocabulary learning system.

## Features

- Visual vocabulary dashboard
- Word cards with definitions, examples, and Hindi translations
- AI-powered word enrichment
- Text-to-speech pronunciation
- Progress tracking
- Dark/light theme

## Development

```bash
# From the monorepo root
bun run dev:web

# Or directly
cd apps/web
bun run dev
```

Runs on `http://localhost:3001`.

## Environment Variables

The web app uses shared environment configuration from `@vocab/env`. Required variables:

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: `http://localhost:3000`)
- `BETTER_AUTH_URL` - Auth callback URL

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── login/             # Authentication
│   └── dashboard/         # Protected vocabulary dashboard
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── vocab/             # Vocabulary-specific components
│   └── landing/           # Landing page components
├── lib/                   # Utilities and clients
└── utils/                 # Helper functions
```

## Tech Stack

- Next.js 16 with App Router
- React 19
- TailwindCSS v4
- shadcn/ui components
- JetBrains Mono font
- Better-Auth for authentication

## Design System

- Monospace typography throughout
- Sharp edges (0px border radius)
- True black dark theme
- Minimal, Vercel-inspired aesthetic
