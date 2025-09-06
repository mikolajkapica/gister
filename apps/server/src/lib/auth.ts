import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { expo } from "@better-auth/expo";
import { jwt } from "better-auth/plugins";
import { makeDb, type EnvWithDB } from "../db";
import { user, session, account, verification } from "../db/schema/auth";

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
			schema: { user, session, account, verification },
		}),
		// Allow deep-link redirects back into the Expo app and CORS origin for dev tools
		trustedOrigins: [env.CORS_ORIGIN, "my-better-t-app://"],
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
		plugins: [expo(), jwt()],
	});
}

export type AuthInstance = ReturnType<typeof getAuth>;
