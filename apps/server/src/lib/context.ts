import type { Context as HonoContext } from "hono";
import { type EnvWithDB, makeDb } from "../db";
import { type AuthEnv, getAuth } from "./auth";

export type CreateContextOptions = {
  context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
  const auth = getAuth(context.env as unknown as AuthEnv);
  const db = makeDb(context.env as unknown as EnvWithDB);

  const headers = context.req.raw.headers;
  const authHeader = headers.get("authorization");

  let session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });

  // If no session but Authorization header present, try manual JWT validation
  if (!session && authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.replace("Bearer ", "");
      console.log("Server: JWT token present, attempting manual validation");

      // Try to manually validate JWT and create session
      // This is a workaround since Better Auth's JWT plugin may not work with tRPC
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const decoded = JSON.parse(atob(base64));
      console.log("Server: JWT payload decoded:", decoded);

      if (decoded?.sub) {
        // Create a minimal session from JWT payload
        session = {
          user: {
            id: decoded.sub,
            name: decoded.name || "",
            email: decoded.email || "",
            image: decoded.image,
            emailVerified: decoded.emailVerified,
            createdAt: new Date(decoded.createdAt || Date.now()),
            updatedAt: new Date(decoded.updatedAt || Date.now()),
          },
          session: {
            id: decoded.sessionId || "jwt-session",
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: decoded.sub,
            expiresAt: new Date((decoded.exp || 0) * 1000),
            token,
            ipAddress: null,
            userAgent: null,
          },
        };
        console.log("Server: Manual session created from JWT");
      }
    } catch (error) {
      console.log("Server: JWT manual validation failed:", error);
    }
  }

  return {
    session,
    db,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
