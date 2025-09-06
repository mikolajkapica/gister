import { drizzle } from "drizzle-orm/d1";

export type EnvWithDB = {
	DB: unknown;
};

export function makeDb(env: EnvWithDB) {
	// Cast to 'never' to avoid requiring CF Workers types at build time.
	// Wrangler will provide a proper D1Database at runtime.
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	return drizzle(env.DB as never);
}

export type DB = ReturnType<typeof makeDb>;
