"use client";

import Image from "next/image";

const aiProviders = ["anthropic", "openai", "google"];

export default function StackedAvatars() {
  return (
    <div className="flex items-center">
      {aiProviders.map((provider, index) => (
        <div
          key={provider}
          className="flex items-center justify-center size-6 rounded-full border-2 border-background ring-1 ring-border bg-white dark:bg-zinc-900"
          style={{
            marginLeft: index === 0 ? 0 : -10,
            zIndex: aiProviders.length - index,
          }}
        >
          <Image
            alt={`${provider} logo`}
            className="size-3 dark:invert"
            height={10}
            src={`https://models.dev/logos/${provider}.svg`}
            unoptimized
            width={10}
          />
        </div>
      ))}
    </div>
  );
}
