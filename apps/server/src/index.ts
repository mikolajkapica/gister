import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./routers/index";
import { createContext } from "./lib/context";
import { getAuth, type AuthEnv } from "./lib/auth";

// Type the Hono app so c.env is known
const app = new Hono<{
	Bindings: AuthEnv;
}>();

app.use(logger());

// Env-aware CORS (no async wrapper needed)
app.use(
	"/*",
	cors({
		origin: (_origin, c) => c.env.CORS_ORIGIN || "",
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

// BetterAuth routes
app.on(["POST", "GET"], "/api/auth/**", (c) => getAuth(c.env).handler(c.req.raw));

// tRPC
app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: (_opts, context) => createContext({ context }),
	}),
);

// Health
app.get("/", (c) => c.text("OK"));

export default app;
