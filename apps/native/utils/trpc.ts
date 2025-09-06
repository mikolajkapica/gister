import { authClient } from "@/lib/auth-client";
import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "../../server/src/routers";

// Simple in-memory JWT cache (refresh every ~10 minutes)
let cachedJwt: string | null = null;
let cachedAt = 0;
const JWT_CACHE_TTL_MS = 600_000;

async function getJwt(): Promise<string | null> {
	const now = Date.now();
	if (cachedJwt && now - cachedAt < JWT_CACHE_TTL_MS) {
		return cachedJwt;
	}
	// Trigger a session fetch to read the `set-auth-jwt` response header
	await authClient.getSession({
		fetchOptions: {
			onSuccess: (ctx) => {
				const token = ctx.response.headers.get("set-auth-jwt");
				if (token) {
					cachedJwt = token;
					cachedAt = Date.now();
				}
			},
		},
	});
	return cachedJwt;
}

export const queryClient = new QueryClient();

const trpcClient = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: `${process.env.EXPO_PUBLIC_SERVER_URL}/trpc`,
			async headers() {
				const headers = new Map<string, string>();
				// Prefer JWT for auth between app and backend
				const jwt = await getJwt();
				if (jwt) {
					headers.set("Authorization", `Bearer ${jwt}`);
				}
				// Also forward session cookies for compatibility
				const cookies = authClient.getCookie();
				if (cookies) {
					headers.set("Cookie", cookies);
				}
				return Object.fromEntries(headers);
			},
		}),
	],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
	client: trpcClient,
	queryClient,
});
