# @vocably/web

Next.js web application for vocabulary management.

## Features

- Visual vocabulary dashboard
- Word cards with definitions, examples, and Hindi translations
- AI-powered word enrichment
- Text-to-speech pronunciation
- Dark/light theme

## Development

```bash
bun run dev:web
```

Runs on http://localhost:3001

## Environment Variables

Required in `apps/web/.env`:

```env
NEXT_PUBLIC_SERVER_URL="http://localhost:3000"
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── login/             # Authentication
│   └── dashboard/         # Vocabulary dashboard
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── vocab/             # Vocabulary components
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
