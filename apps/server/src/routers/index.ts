import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { TRPCError } from "@trpc/server";
import { account } from "../db/schema/auth";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { todoRouter } from "./todo";

const GistItem = z.object({
	id: z.string(),
	description: z.string().nullable().transform((v) => v ?? ""),
	files: z.number().int(),
	public: z.boolean(),
	html_url: z.string().url(),
	updated_at: z.string(),
});

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),

	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),

	// listGists: fetch the authenticated user's GitHub gists
	listGists: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		const rows = await ctx.db
			.select({ accessToken: account.accessToken })
			.from(account)
			.where(and(eq(account.userId, userId), eq(account.providerId, "github")))
			.limit(1);

		const accessToken = rows[0]?.accessToken;
		if (!accessToken) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "GitHub account not linked",
			});
		}

		const res = await fetch("https://api.github.com/gists?per_page=50", {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/vnd.github+json",
				"User-Agent": "gister-app",
			},
		});

		if (!res.ok) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: `GitHub API error (${res.status})`,
			});
		}

		const json = (await res.json()) as unknown[];

		const RawGist = z.object({
			id: z.string(),
			description: z.string().nullable().optional(),
			files: z.record(z.string(), z.unknown()).optional(),
			public: z.boolean(),
			html_url: z.string().url(),
			updated_at: z.string(),
		});

		const items = (json as unknown[]).map((g) => {
			const raw = RawGist.parse(g);
			return GistItem.parse({
				id: raw.id,
				description: raw.description ?? "",
				files: raw.files ? Object.keys(raw.files).length : 0,
				public: raw.public,
				html_url: raw.html_url,
				updated_at: raw.updated_at,
			});
		});

		return items;
	}),

	todo: todoRouter,
});

export type AppRouter = typeof appRouter;
