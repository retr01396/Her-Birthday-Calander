import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";
import {
  clientIp,
  countFailures,
  recordFailure,
  clearCounter,
} from "@/lib/rateLimit";

const SIGNIN_MAX_FAILURES = 5;
const SIGNIN_WINDOW_SEC = 900; // 15 minutes

/**
 * Brute-force protection for the password endpoint (fail-open when Redis is
 * down, mirroring the OTP helpers). Keyed by identifier + client IP so an
 * attacker hammering one account locks it while the real owner (different IP)
 * can still sign in.
 */
function failKey(identifier: string, req: Request) {
  return `signin:fail:${identifier}:${clientIp(req)}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const identifier =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase()
        : typeof body?.username === "string"
        ? body.username.trim().toLowerCase()
        : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Username/Email and password are required." },
        { status: 400 }
      );
    }

    const key = failKey(identifier, req);
    if ((await countFailures(key)) >= SIGNIN_MAX_FAILURES) {
      return NextResponse.json(
        { error: "Too many failed sign-in attempts. Please try again later." },
        { status: 429 }
      );
    }

    // 1. Try finding Student or Super Admin user by email
    const user = await prisma.user.findUnique({ where: { email: identifier } });
    if (user && verifyPassword(password, user.password)) {
      await clearCounter(key);
      await createSession(user.id);
      return NextResponse.json({
        message: "Signed in successfully.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    }

    // 2. Try finding Club account by username
    const club = await prisma.club.findUnique({ where: { username: identifier } });
    if (club && verifyPassword(password, club.passwordHash)) {
      await clearCounter(key);
      await createSession(club.id);
      return NextResponse.json({
        message: "Club signed in successfully.",
        user: {
          id: club.id,
          name: club.name,
          email: club.username,
          role: "CLUB",
          slug: club.slug,
          createdAt: club.createdAt,
        },
      });
    }

    // Invalid credentials — count toward the lockout.
    const { blocked } = await recordFailure(key, SIGNIN_WINDOW_SEC, SIGNIN_MAX_FAILURES);
    if (blocked) {
      return NextResponse.json(
        { error: "Too many failed sign-in attempts. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Invalid username/email or password." },
      { status: 401 }
    );
  } catch (err) {
    console.error("[auth/signin] error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
