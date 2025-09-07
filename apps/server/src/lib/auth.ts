import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt } from "better-auth/plugins";
import { type EnvWithDB, makeDb } from "../db";
import { account, jwks, session, user, verification } from "../db/schema/auth";

/**
 * Cloudflare Worker variables required by auth.
 * Keep in sync with wrangler.jsonc and .env.example.
 */
export type CloudflareEnv = {
  CORS_ORIGIN: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
};

export type AuthEnv = CloudflareEnv & EnvWithDB;

/**
 * Factory to create BetterAuth instance with request-time env.
 */
export function getAuth(env: AuthEnv) {
  return betterAuth({
    database: drizzleAdapter(makeDb(env), {
      provider: "sqlite",
      schema: { user, session, account, verification, jwks },
    }),
    // Allow deep-link redirects back into the Expo app and CORS origin for dev tools
    trustedOrigins: [
      "https://1ry3rpk-mikolajkapica-8081.exp.direct",
      "my-better-t-app:///",
    ],
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        scope: ["gist"],
      },
    },
    emailAndPassword: {
      enabled: true,
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    advanced: {
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
        httpOnly: true,
      },
    },
    // Expo integration and JWT issuance (set-auth-jwt header and /api/auth/token)
    // Disable JWKS endpoint to avoid requiring additional database tables
    plugins: [
      expo(),
      jwt({
        disableSettingJwtHeader: false, // Keep header for client-side token access
      }),
    ],
  });
}

export type AuthInstance = ReturnType<typeof getAuth>;
