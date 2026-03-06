import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const SHARD_COUNT = 128;

/** Returns the globally aggregated press count. */
export const getTotal = query({
  args: {},
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

/** Increments the global press count using a write-sharded counter for scale. */
export const increment = mutation({
  args: {
    shardHint: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const shard =
      args.shardHint === undefined
        ? Math.floor(Math.random() * SHARD_COUNT)
        : Math.max(0, Math.min(SHARD_COUNT - 1, Math.floor(args.shardHint)));

    const existing = await ctx.db
      .query("counterShards")
      .withIndex("by_shard", (q) => q.eq("shard", shard))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        count: existing.count + 1,
        updatedAt: Date.now(),
      });
      return { ok: true, shard };
    }

    await ctx.db.insert("counterShards", {
      shard,
      count: 1,
      updatedAt: Date.now(),
    });

    return { ok: true, shard };
  },
});
