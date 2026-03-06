import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  counterShards: defineTable({
    shard: v.number(),
    count: v.number(),
    updatedAt: v.number(),
  }).index("by_shard", ["shard"]),
  botClients: defineTable({
    clientIdHash: v.string(),
    windowStartedAt: v.number(),
    pressesInWindow: v.number(),
    lastPressAt: v.number(),
    blockedUntil: v.optional(v.number()),
  }).index("by_clientIdHash", ["clientIdHash"]),
  usedCaptchaTokens: defineTable({
    tokenHash: v.string(),
    verifiedAt: v.number(),
  }).index("by_tokenHash", ["tokenHash"]),
});
