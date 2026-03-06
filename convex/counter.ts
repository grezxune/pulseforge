import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const SHARD_COUNT = 128;

/** Returns the globally aggregated press count. */
export const getTotal = query({
  args: {},
  returns: v.object({
    total: v.number(),
    shardCount: v.number(),
    activeShards: v.number(),
  }),
  handler: async (ctx) => {
    const shards = await ctx.db.query("counterShards").collect();
    const total = shards.reduce((sum, shard) => sum + shard.count, 0);

    return {
      total,
      shardCount: SHARD_COUNT,
      activeShards: shards.length,
    };
  },
});

/** Increments the global counter. */
export const increment = mutation({
  args: {
    shardHint: v.optional(v.number()),
  },
  returns: v.object({
    ok: v.boolean(),
    shard: v.number(),
  }),
  handler: async (ctx, args) => {
    const now = Date.now();
    const shard =
      args.shardHint === undefined
        ? Math.floor(Math.random() * SHARD_COUNT)
        : Math.max(0, Math.min(SHARD_COUNT - 1, Math.floor(args.shardHint)));

    const existingShard = await ctx.db
      .query("counterShards")
      .withIndex("by_shard", (q) => q.eq("shard", shard))
      .unique();

    if (existingShard) {
      await ctx.db.patch(existingShard._id, {
        count: existingShard.count + 1,
        updatedAt: now,
      });
      return { ok: true, shard };
    }

    await ctx.db.insert("counterShards", {
      shard,
      count: 1,
      updatedAt: now,
    });

    return { ok: true, shard };
  },
});
