"use client";

import Link from "next/link";

import { AsciiHero } from "@/components/landing/ascii-hero";
import { FeatureCard } from "@/components/landing/feature-card";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import {
  BotIcon,
  GlobeIcon,
  MessageSquareTextIcon,
  TerminalIcon,
} from "lucide-react";
import AvatarDemo from "@/components/ui/stacked-avatars";

export default function Home() {
  const { data: session } = authClient.useSession();

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto max-w-5xl px-4 py-16 md:py-24">
          <div className="flex justify-between items-center text-center gap-8">
            {/* <AsciiHero /> */}
            <h1 className="font-departure text-4xl">Vocably</h1>
            {/* <p className="text-muted-foreground text-sm md:text-base max-w-md">
              Build your vocabulary. Anywhere.
            </p> */}
            <div className="flex gap-4">
              {session ? (
                <Link href="/dashboard">
                  <Button>Go to Dashboard</Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button>Get Started</Button>
                </Link>
              )}
            </div>
          </div>
          <h1 className="font-departure text-xl opacity-50 font-light">
            Manage your vocabulary.
          </h1>
          <h1 className="font-departure text-xl opacity-50 font-light">
            Anywhere. Anytime.
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-md mt-10">
            while()
            <br />
			<div className="flex flex-col gap-2 mt-2">
            <div className="flex justify-start items-center gap-2">
              on the
              <div className="bg-muted/30 p-2 py-1 w-fit border rounded-[20px] text-sm">
                <GlobeIcon className="w-4 h-4 inline-block" /> internet
              </div>
            </div>
            <div className="flex justify-start items-center gap-2">
              in the
              <div className="bg-muted/30 p-2 py-1 w-fit border rounded-[20px] text-sm">
                <TerminalIcon className="w-4 h-4 inline-block" /> CLI
              </div>
            </div>
            <div className="flex justify-start items-center gap-2">
              or your
              <div className="bg-muted/30 p-2 py-1.5 w-fit border rounded-[20px] text-sm flex justify-start items-center gap-2">
                <AvatarDemo />
                ai conversations{" "}
              </div>
			</div>

            </div>
          </p>
        </section>
        {/* <span className="font-mono underline text-[#1612D2]">[ vocab.surajgaud.com ]</span> */}
        {/* <span className="font-mono underline text-[#1612D2]">[ vocably-cli ]</span> */}
        {/* <span className="font-mono underline text-[#1612D2]">[ vocably-mcp ]</span> */}

        {/* Features Section */}
        <section className="container mx-auto max-w-5xl px-4 py-16 border-t border-border">
          <h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-8">
            Three ways to learn
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon="[WEB]"
              title="Browser Dashboard"
              description="Visual interface for managing your vocabulary. Track progress, review words, and see AI-powered insights."
            />
            <FeatureCard
              icon="[CLI]"
              title="Terminal Power"
              description="Add words from anywhere in your terminal. Fast, scriptable, and keyboard-driven."
              code="$ vocab add serendipity"
            />
            <FeatureCard
              icon="[MCP]"
              title="AI-Native"
              description="Works directly with Claude. Add and review vocabulary without leaving your conversation."
            />
          </div>
        </section>

        {/* How it works */}
        <section className="container mx-auto max-w-5xl px-4 py-16 border-t border-border">
          <h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-8">
            How it works
          </h2>
          <div className="grid gap-6 text-sm">
            <div className="flex gap-4 items-start">
              <span className="text-muted-foreground font-mono">01</span>
              <div>
                <p className="font-medium">Add a word</p>
                <p className="text-muted-foreground">
                  From the web, CLI, or through Claude
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <span className="text-muted-foreground font-mono">02</span>
              <div>
                <p className="font-medium">AI enrichment</p>
                <p className="text-muted-foreground">
                  Get definitions, examples, native language translations, and mnemonics
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <span className="text-muted-foreground font-mono">03</span>
              <div>
                <p className="font-medium">Review and learn</p>
                <p className="text-muted-foreground">
                  Track your progress across all platforms
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* AI Integration Section */}
        <section className="container mx-auto max-w-5xl px-4 py-16 border-t border-border">
          <h2 className="text-2xl font-medium mb-2">Connect to a client</h2>
          <p className="text-muted-foreground text-sm mb-8">
            Select your preferred way to connect to your MCP server.
          </p>

          {/* Client Cards */}
          <div className="grid md:grid-cols-2 gap-4 mb-16">
            <div className="border border-border bg-card p-6 hover:border-foreground/20 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 border border-dashed border-border flex items-center justify-center p-2">
                  <svg preserveAspectRatio="xMidYMid" viewBox="0 0 256 257"><path fill="#D97757" d="m50.228 170.321 50.357-28.257.843-2.463-.843-1.361h-2.462l-8.426-.518-28.775-.778-24.952-1.037-24.175-1.296-6.092-1.297L0 125.796l.583-3.759 5.12-3.434 7.324.648 16.202 1.101 24.304 1.685 17.629 1.037 26.118 2.722h4.148l.583-1.685-1.426-1.037-1.101-1.037-25.147-17.045-27.22-18.017-14.258-10.37-7.713-5.25-3.888-4.925-1.685-10.758 7-7.713 9.397.649 2.398.648 9.527 7.323 20.35 15.75L94.817 91.9l3.889 3.24 1.555-1.102.195-.777-1.75-2.917-14.453-26.118-15.425-26.572-6.87-11.018-1.814-6.61c-.648-2.723-1.102-4.991-1.102-7.778l7.972-10.823L71.42 0 82.05 1.426l4.472 3.888 6.61 15.101 10.694 23.786 16.591 32.34 4.861 9.592 2.592 8.879.973 2.722h1.685v-1.556l1.36-18.211 2.528-22.36 2.463-28.776.843-8.1 4.018-9.722 7.971-5.25 6.222 2.981 5.12 7.324-.713 4.73-3.046 19.768-5.962 30.98-3.889 20.739h2.268l2.593-2.593 10.499-13.934 17.628-22.036 7.778-8.749 9.073-9.657 5.833-4.601h11.018l8.1 12.055-3.628 12.443-11.342 14.388-9.398 12.184-13.48 18.147-8.426 14.518.778 1.166 2.01-.194 30.46-6.481 16.462-2.982 19.637-3.37 8.88 4.148.971 4.213-3.5 8.62-20.998 5.184-24.628 4.926-36.682 8.685-.454.324.519.648 16.526 1.555 7.065.389h17.304l32.21 2.398 8.426 5.574 5.055 6.805-.843 5.184-12.962 6.611-17.498-4.148-40.83-9.721-14-3.5h-1.944v1.167l11.666 11.406 21.387 19.314 26.767 24.887 1.36 6.157-3.434 4.86-3.63-.518-23.526-17.693-9.073-7.972-20.545-17.304h-1.36v1.814l4.73 6.935 25.017 37.59 1.296 11.536-1.814 3.76-6.481 2.268-7.13-1.297-14.647-20.544-15.1-23.138-12.185-20.739-1.49.843-7.194 77.448-3.37 3.953-7.778 2.981-6.48-4.925-3.436-7.972 3.435-15.749 4.148-20.544 3.37-16.333 3.046-20.285 1.815-6.74-.13-.454-1.49.194-15.295 20.999-23.267 31.433-18.406 19.702-4.407 1.75-7.648-3.954.713-7.064 4.277-6.286 25.47-32.405 15.36-20.092 9.917-11.6-.065-1.686h-.583L44.07 198.125l-12.055 1.555-5.185-4.86.648-7.972 2.463-2.593 20.35-13.999-.064.065Z"/></svg>
                </div>
                <span className="text-lg">Claude Code</span>
              </div>
            </div>
            <div className="border border-border bg-card p-6 hover:border-foreground/20 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 border border-dashed border-border flex items-center justify-center p-2">
                  
                    <svg preserveAspectRatio="xMidYMid" className="invert dark:invert-0" viewBox="0 0 256 260">
                      <path
                        fill="#fff"
                        d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z"
                      />
                    </svg>
                </div>
                <span className="text-lg">Codex / OpenAI</span>
              </div>
            </div>
          </div>

          {/* Standard Connection */}
          <div>
            <h3 className="text-2xl font-medium mb-2">Standard connection</h3>
            <p className="text-muted-foreground text-sm mb-6">
              For clients not listed above, you can use the following connection method.
            </p>
            <div className="relative">
              <pre className="text-xs bg-card p-6 border border-border overflow-x-auto whitespace-pre font-mono">
                <code>{`{
  "command": "npx",
  "args": [
    "mcp-remote",
    "https://vocab.surajgaud.com/api/mcp"
  ]
}`}</code>
              </pre>
              <button className="absolute top-4 right-4 p-2 hover:bg-muted/50 rounded transition-colors">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-6">
              Get your API token from{" "}
              <Link
                href="/dashboard/settings/api-keys"
                className="underline hover:text-foreground transition-colors"
              >
                Settings → API Keys
              </Link>{" "}
              after signing up.
            </p>
          </div>

          {/* Available Tools */}
          <div className="mt-12 bg-card border border-border p-6">
            <p className="text-sm font-medium mb-4">Available Tools</p>
            <div className="grid md:grid-cols-5 gap-4 text-xs">
              <div>
                <code className="text-muted-foreground">add-word</code>
                <p className="text-muted-foreground mt-1">
                  Add new vocabulary
                </p>
              </div>
              <div>
                <code className="text-muted-foreground">list-words</code>
                <p className="text-muted-foreground mt-1">List your words</p>
              </div>
              <div>
                <code className="text-muted-foreground">get-word</code>
                <p className="text-muted-foreground mt-1">Get word details</p>
              </div>
              <div>
                <code className="text-muted-foreground">search-words</code>
                <p className="text-muted-foreground mt-1">
                  Search vocabulary
                </p>
              </div>
              <div>
                <code className="text-muted-foreground">remove-word</code>
                <p className="text-muted-foreground mt-1">Remove a word</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Start Section */}
        <section className="container mx-auto max-w-5xl px-4 py-16 border-t border-border">
          <h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-8">
            Quick start
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm font-medium mb-2">1. Create an account</p>
              <p className="text-xs text-muted-foreground mb-4">
                Sign up to get your API token
              </p>
              <Link href="/login">
                <Button variant="outline" className="text-xs">
                  Get Started
                </Button>
              </Link>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">2. Install the CLI</p>
              <p className="text-xs text-muted-foreground mb-4">
                Optional: manage vocabulary from terminal
              </p>
              <pre className="text-xs bg-card p-4 border border-border overflow-x-auto">
                <code>npm install -g vocably-cli</code>
              </pre>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
