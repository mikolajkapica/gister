import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { authClient } from "@/lib/auth-client";
import type { AppRouter } from "../../server/src/routers";

// Simple in-memory JWT cache (refresh every ~10 minutes)
let cachedJwt: string | null = null;
let cachedAt = 0;
const JWT_CACHE_TTL_MS = 600_000;

async function getJwt(): Promise<string | null> {
  const now = Date.now();
  if (cachedJwt && now - cachedAt < JWT_CACHE_TTL_MS) {
    console.log("Using cached JWT");
    return cachedJwt;
  }
  try {
    console.log("Fetching new JWT from auth client");
    // Trigger a session fetch to read the `set-auth-jwt` response header
    await authClient.getSession({
      fetchOptions: {
        onSuccess: (ctx) => {
          const token = ctx.response.headers.get("set-auth-jwt");
          console.log("JWT token retrieved:", token ? "present" : "null");
          if (token) {
            cachedJwt = token;
            cachedAt = Date.now();
          }
        },
        onError: (error) => {
          console.log("Auth client getSession error:", error);
        },
      },
    });
  } catch (error) {
    console.log("Failed to get session:", error);
  }
  console.log("Final JWT result:", cachedJwt ? "present" : "null");
  return cachedJwt;
}

export const queryClient = new QueryClient();

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${process.env.EXPO_PUBLIC_SERVER_URL}/trpc`,
      async headers() {
        const headers = new Map<string, string>();
        // Prefer JWT for auth between app and backend
        const jwt = await getJwt();
        console.log("Client: JWT token retrieved:", jwt ? "present" : "null");
        if (jwt) {
          headers.set("Authorization", `Bearer ${jwt}`);
          console.log("Client: Setting Authorization header");
        } else {
          console.log("Client: No JWT token, no Authorization header set");
        }

        // Cookies not needed for web, JWT is sufficient
        return Object.fromEntries(headers);
      },
    }),
  ],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});
