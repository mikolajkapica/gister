import type { Context as HonoContext } from "hono";
import { getAuth, type AuthEnv } from "./auth";
import { makeDb, type EnvWithDB } from "../db";

export type CreateContextOptions = {
	context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
	const auth = getAuth(context.env as unknown as AuthEnv);
	const db = makeDb(context.env as unknown as EnvWithDB);

	const session = await auth.api.getSession({
		headers: context.req.raw.headers,
	});

	return {
		session,
		db,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
