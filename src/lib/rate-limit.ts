import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getServerDb } from "./firebase/server";

type RateLimitAction = "newsletter" | "comment" | "like";

const CONFIGS: Record<RateLimitAction, { windowMs: number; max: number }> = {
  newsletter: { windowMs: 60 * 60 * 1000, max: 5 },
  comment: { windowMs: 60 * 60 * 1000, max: 20 },
  like: { windowMs: 60 * 60 * 1000, max: 300 },
};

type RateLimitResult = { allowed: true } | { allowed: false; retryAfterMs: number };

export async function checkRateLimit(
  action: RateLimitAction,
  identifier: string,
): Promise<RateLimitResult> {
  const { windowMs, max } = CONFIGS[action];
  const now = Date.now();
  const windowStart = new Timestamp(Math.floor((now - windowMs) / 1000), 0);

  const db = getServerDb();
  const docRef = db.collection("rateLimits").doc(`${action}:${identifier}`);

  try {
    const result = await db.runTransaction(async (tx) => {
      const doc = await tx.get(docRef);
      const data = doc.data();

      // Filter out timestamps outside the window
      const hits: Timestamp[] = (data?.hits ?? []).filter(
        (t: Timestamp) => t.toMillis() >= windowStart.toMillis(),
      );

      if (hits.length >= max) {
        const oldest = hits[0];
        const retryAfterMs = oldest.toMillis() + windowMs - now;
        return { allowed: false as const, retryAfterMs: Math.max(retryAfterMs, 0) };
      }

      tx.set(
        docRef,
        { hits: [...hits, Timestamp.fromMillis(now)], updatedAt: FieldValue.serverTimestamp() },
        { merge: false },
      );
      return { allowed: true as const };
    });
    return result;
  } catch {
    // On error, allow the request through rather than blocking legitimate traffic
    return { allowed: true };
  }
}
