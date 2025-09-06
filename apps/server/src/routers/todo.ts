import z from "zod";
import { router, publicProcedure } from "../lib/trpc";
import { todo } from "../db/schema/todo";
import { eq } from "drizzle-orm";

export const todoRouter = router({
	getAll: publicProcedure.query(async ({ ctx }) => {
		return await ctx.db.select().from(todo);
	}),

	create: publicProcedure
		.input(z.object({ text: z.string().min(1) }))
		.mutation(async ({ input, ctx }) => {
			return await ctx.db.insert(todo).values({
				text: input.text,
			});
		}),

	toggle: publicProcedure
		.input(z.object({ id: z.number(), completed: z.boolean() }))
		.mutation(async ({ input, ctx }) => {
			return await ctx.db
				.update(todo)
				.set({ completed: input.completed })
				.where(eq(todo.id, input.id));
		}),

	delete: publicProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input, ctx }) => {
			return await ctx.db.delete(todo).where(eq(todo.id, input.id));
		}),
});
