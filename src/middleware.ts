import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isDayUnlocked, currentUnlockedDay } from "./lib/birthday/dates";

async function getSessionInfo(req: NextRequest): Promise<{
  role: string | null;
  clubStatus: string | null;
}> {
  const sessionId = req.cookies.get("campushub_session")?.value;
  if (!sessionId) return { role: null, clubStatus: null };

  try {
    // Fetch user from the API route to determine role and club status
    const baseUrl = req.nextUrl.origin;
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Cookie: `campushub_session=${sessionId}` },
    });
    const data = await res.json();
    return {
      role: data.user?.role ?? null,
      clubStatus: data.user?.clubStatus ?? null,
    };
  } catch {
    return { role: null, clubStatus: null };
  }
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // ── Birthday journey guard ────────────────────────────────────
  // Runs before auth so it applies to every visitor (the recipient
  // won't be signed in). A locked (future) day can never be revealed
  // by typing its URL: the unlock check re-runs on every request.
  if (path.startsWith("/birthday/day/")) {
    const day = Number(path.split("/")[3]);
    if (!Number.isInteger(day) || !isDayUnlocked(day)) {
      // Not unlocked yet — send them to the calendar instead of
      // leaking any future content.
      const url = new URL("/birthday/journey", req.url);
      if (currentUnlockedDay() > 0) url.searchParams.set("locked", day.toString());
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const { role, clubStatus } = await getSessionInfo(req);

  const isAuthenticated = role !== null;
  const isClubLoginPage = path.startsWith("/club/login");

  // Redirect unauthenticated users (the club login page stays public so a
  // club representative can sign in with their provisioned credentials)
  if (!isAuthenticated) {
    if (path.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (path.startsWith("/club") && !isClubLoginPage) {
      return NextResponse.redirect(new URL("/club/login", req.url));
    }
    return NextResponse.next();
  }

  // Super Admin only routes
  if (path.startsWith("/admin")) {
    if (role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Club Dashboard routes (Accessible by CLUB account and SUPER_ADMIN)
  if (path.startsWith("/club")) {
    if (role !== "CLUB" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // A CLUB account that hasn't published its profile yet may only visit
    // the setup wizard — everything else is redirected there until publish.
    const isSetupPage = path.startsWith("/club/setup");
    if (
      role === "CLUB" &&
      clubStatus === "UNPUBLISHED" &&
      !isSetupPage &&
      !isClubLoginPage
    ) {
      return NextResponse.redirect(new URL("/club/setup", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/club/:path*", "/birthday/day/:path*"],
};
