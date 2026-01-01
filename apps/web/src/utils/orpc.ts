import type { AppRouterClient } from "@vocably/api/routers/index";

import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      toast.error(`Error: ${error.message}`, {
        action: {
          label: "retry",
          onClick: query.invalidate,
        },
      });
    },
  }),
});

// Use the frontend's RPC proxy route instead of backend directly
// This ensures cookies are sent correctly (same-origin request)
const getRpcUrl = () => {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/rpc`;
  }
  // Server-side: use environment variable or default
  return `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/api/rpc`;
};

export const link = new RPCLink({
  url: getRpcUrl(),
  fetch(url, options) {
    return fetch(url, {
      ...options,
      credentials: "include",
    });
  },
  headers: async () => {
    if (typeof window !== "undefined") {
      return {};
    }

    const { headers } = await import("next/headers");
    return Object.fromEntries(await headers());
  },
});

export const client: AppRouterClient = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
