import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { redisCmd } from "./redis";

const SESSION_COOKIE = "campushub_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const SESSION_KEY_PREFIX = "campushub:session:";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  onboardingCompleted: boolean;
  clubId?: string;
  slug?: string;
  /** Publication state of the club account (CLUB role only). */
  clubStatus?: string;
};

function sessionKey(token: string) {
  return `${SESSION_KEY_PREFIX}${token}`;
}

/**
 * Create a session: store the userId in Redis keyed by a random token,
 * then set the token as an httpOnly cookie.
 */
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  await redisCmd((client) =>
    client.set(sessionKey(token), userId, { EX: SESSION_TTL_SECONDS })
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });
}

/**
 * Destroy the current session (delete the Redis key + cookie).
 */
export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await redisCmd((client) => client.del(sessionKey(token)));
  }
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Resolve the session token in the cookie to a userId via Redis.
 * Returns null if there is no valid session.
 */
export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const userId = await redisCmd((client) => client.get(sessionKey(token)));
  return userId ?? null;
}

/**
 * Get the currently logged-in user or club account from the Redis-backed session.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      onboardingCompleted: true,
    },
  });

  if (user) {
    return user;
  }

  const club = await prisma.club.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      slug: true,
      status: true,
    },
  });

  if (club) {
    return {
      id: club.id,
      name: club.name,
      email: club.username,
      role: "CLUB",
      onboardingCompleted: true,
      clubId: club.id,
      slug: club.slug ?? "",
      clubStatus: club.status,
    };
  }

  return null;
}
