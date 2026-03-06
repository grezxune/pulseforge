import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import { sha256Hex } from "./lib/hash";

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type TurnstileVerification = {
  success: boolean;
  action?: string;
  hostname?: string;
  "error-codes"?: string[];
};

async function verifyCaptchaToken(
  secretKey: string,
  captchaToken: string,
): Promise<TurnstileVerification> {
  const payload = new URLSearchParams({
    secret: secretKey,
    response: captchaToken,
  });

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: payload,
  });

  if (!response.ok) {
    throw new Error("Captcha verification service is unavailable.");
  }

  return (await response.json()) as TurnstileVerification;
}

/**
 * Verifies captcha and applies server-side anti-abuse checks before incrementing.
 */
export const pressWithProtection = action({
  args: {
    captchaToken: v.string(),
    clientId: v.string(),
    shardHint: v.optional(v.number()),
  },
  returns: v.object({
    ok: v.boolean(),
    shard: v.number(),
  }),
  handler: async (
    ctx,
    args,
  ): Promise<{
    ok: boolean;
    shard: number;
  }> => {
    const captchaToken = args.captchaToken.trim();
    const clientId = args.clientId.trim();

    if (captchaToken.length < 20) {
      throw new Error("Captcha token is invalid.");
    }

    if (clientId.length < 16 || clientId.length > 128) {
      throw new Error("Client identity is invalid.");
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY;

    if (!secretKey) {
      throw new Error("Server bot protection is not configured.");
    }

    const verification = await verifyCaptchaToken(secretKey, captchaToken);

    if (!verification.success) {
      throw new Error("Bot verification failed.");
    }

    if (verification.action && verification.action !== "press") {
      throw new Error("Captcha action mismatch.");
    }

    const expectedHostname = process.env.TURNSTILE_EXPECTED_HOSTNAME;

    if (
      expectedHostname &&
      verification.hostname &&
      verification.hostname !== expectedHostname
    ) {
      throw new Error("Captcha hostname mismatch.");
    }

    const tokenHash = await sha256Hex(`captcha:${captchaToken}`);
    const clientIdHash = await sha256Hex(`client:${clientId}`);

    await ctx.runMutation(internal.counter.consumeCaptchaToken, {
      tokenHash,
    });

    return await ctx.runMutation(internal.counter.internalIncrement, {
      clientIdHash,
      shardHint: args.shardHint,
    });
  },
});
