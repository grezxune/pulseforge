import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

const SHARD_COUNT = 128;
const WINDOW_MS = 60_000;
const MAX_PRESSES_PER_WINDOW = 25;
const MIN_PRESS_INTERVAL_MS = 750;
const BLOCK_DURATION_MS = 10 * 60_000;

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

/** Consumes a verified captcha token once to prevent replay attacks. */
export const consumeCaptchaToken = internalMutation({
  args: {
    tokenHash: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existingToken = await ctx.db
      .query("usedCaptchaTokens")
      .withIndex("by_tokenHash", (q) => q.eq("tokenHash", args.tokenHash))
      .unique();

    if (existingToken) {
      throw new Error("Captcha token has already been used.");
    }

    await ctx.db.insert("usedCaptchaTokens", {
      tokenHash: args.tokenHash,
      verifiedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Increments the global counter after enforcing per-client server-side limits.
 */
export const internalIncrement = internalMutation({
  args: {
    clientIdHash: v.string(),
    shardHint: v.optional(v.number()),
  },
  returns: v.object({
    ok: v.boolean(),
    shard: v.number(),
  }),
  handler: async (ctx, args) => {
    const now = Date.now();

    const clientState = await ctx.db
      .query("botClients")
      .withIndex("by_clientIdHash", (q) => q.eq("clientIdHash", args.clientIdHash))
      .unique();

    if (!clientState) {
      await ctx.db.insert("botClients", {
        clientIdHash: args.clientIdHash,
        windowStartedAt: now,
        pressesInWindow: 1,
        lastPressAt: now,
      });
    } else {
      if (clientState.blockedUntil && clientState.blockedUntil > now) {
        throw new Error("Rate limited. Please try again later.");
      }

      if (now - clientState.lastPressAt < MIN_PRESS_INTERVAL_MS) {
        await ctx.db.patch(clientState._id, {
          lastPressAt: now,
          blockedUntil: now + BLOCK_DURATION_MS,
        });
        throw new Error("Too many rapid attempts detected.");
      }

      const shouldResetWindow = now - clientState.windowStartedAt >= WINDOW_MS;
      const nextPressCount = shouldResetWindow
        ? 1
        : clientState.pressesInWindow + 1;

      if (nextPressCount > MAX_PRESSES_PER_WINDOW) {
        await ctx.db.patch(clientState._id, {
          lastPressAt: now,
          pressesInWindow: nextPressCount,
          blockedUntil: now + BLOCK_DURATION_MS,
        });
        throw new Error("Rate limited. Please wait before pressing again.");
      }

      await ctx.db.patch(clientState._id, {
        windowStartedAt: shouldResetWindow ? now : clientState.windowStartedAt,
        pressesInWindow: nextPressCount,
        lastPressAt: now,
      });
    }

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
