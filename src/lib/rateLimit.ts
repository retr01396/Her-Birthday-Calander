import { redisCmd } from "./redis";

/**
 * Redis-backed fixed-window rate limiting for the OTP endpoints.
 *
 * All helpers FAIL OPEN when Redis is unavailable (log + allow) so the OTP
 * flows never break because of an infra hiccup — rate limiting is a
 * hardening layer, not a hard dependency.
 */

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSec?: number;
}

// ── OTP limits ──
export const OTP_REQUEST_COOLDOWN_SEC = 60; // resend cooldown per identifier
export const OTP_REQUEST_EMAIL_LIMIT = 5; // codes per email per window
export const OTP_REQUEST_IP_LIMIT = 10; // codes per IP per window
export const OTP_WINDOW_SEC = 900; // 15 minutes
export const OTP_VERIFY_IP_LIMIT = 30; // verify calls per IP per window
export const OTP_VERIFY_MAX_FAILURES = 5; // wrong codes before locking
export const OTP_VERIFY_FAIL_WINDOW_SEC = 600; // 10 minutes

/** Best-effort client IP from x-forwarded-for (falls back to "unknown"). */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0].trim();
    if (first) return first.slice(0, 64);
  }
  return "unknown";
}

async function hitCounter(
  key: string,
  windowSec: number
): Promise<{ count: number; ttl: number }> {
  return redisCmd(async (r) => {
    const count = await r.incr(key);
    if (count === 1) {
      await r.expire(key, windowSec);
    }
    const ttl = await r.ttl(key);
    return { count, ttl };
  });
}

async function readCounter(key: string): Promise<number> {
  return redisCmd(async (r) => {
    const v = await r.get(key);
    return v ? Number(v) : 0;
  });
}

/**
 * Allow at most `limit` hits per `windowSec` for `key`.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<RateLimitResult> {
  try {
    const { count, ttl } = await hitCounter(key, windowSec);
    if (count > limit) {
      return { allowed: false, retryAfterSec: Math.max(1, ttl) };
    }
    return { allowed: true };
  } catch (err) {
    console.error("[rateLimit] redis unavailable, allowing:", err);
    return { allowed: true };
  }
}

/** Current failure count for a key (0 when Redis is down). */
export async function countFailures(key: string): Promise<number> {
  try {
    return await readCounter(key);
  } catch (err) {
    console.error("[rateLimit] redis unavailable, assuming 0:", err);
    return 0;
  }
}

/**
 * Record one failed attempt. Returns whether the key is now blocked and how
 * many attempts remain before it blocks.
 */
export async function recordFailure(
  key: string,
  windowSec: number,
  maxFailures: number
): Promise<{ blocked: boolean; remaining: number }> {
  try {
    const { count } = await hitCounter(key, windowSec);
    return {
      blocked: count > maxFailures,
      remaining: Math.max(0, maxFailures - count),
    };
  } catch (err) {
    console.error("[rateLimit] redis unavailable, allowing:", err);
    return { blocked: false, remaining: maxFailures };
  }
}

export async function clearCounter(key: string): Promise<void> {
  try {
    await redisCmd(async (r) => r.del(key));
  } catch (err) {
    console.error("[rateLimit] redis unavailable:", err);
  }
}
