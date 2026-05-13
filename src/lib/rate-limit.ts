import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { getServerDb } from "./firebase/server";

const CONFIGS = {
  // newsletter: per-IP. Prevents mass sign-up spam from a single address.
  newsletter: { windowMs: 60 * 60 * 1000, max: 5 },
  // comment: per-uid. Allows active readers while blocking flood attempts.
  comment: { windowMs: 60 * 60 * 1000, max: 20 },
  // like: per-uid. Very generous — likes are idempotent so the main risk is
  // a tight loop hammering Firestore, not spam content.
  like: { windowMs: 60 * 60 * 1000, max: 300 },
} as const;

export type RateLimitAction = keyof typeof CONFIGS;
export type RateLimitResult = { ok: true } | { ok: false; retryAfterMs: number };

export async function checkRateLimit(
  action: RateLimitAction,
  identifier: string,
): Promise<RateLimitResult> {
  const { windowMs, max } = CONFIGS[action];
  const key = `${action}:${identifier}`;
  const ref = getServerDb().collection("rateLimits").doc(key);
  const now = Date.now();

  return getServerDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);

    if (!snap.exists) {
      tx.set(ref, { count: 1, windowStart: now });
      return { ok: true as const };
    }

    const { count, windowStart } = snap.data() as { count: number; windowStart: number };

    if (now - windowStart > windowMs) {
      tx.set(ref, { count: 1, windowStart: now });
      return { ok: true as const };
    }

    if (count >= max) {
      return { ok: false as const, retryAfterMs: windowMs - (now - windowStart) };
    }

    tx.update(ref, { count: FieldValue.increment(1) });
    return { ok: true as const };
  });
}
