import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isDayUnlocked, currentUnlockedDay } from "./lib/birthday/dates";

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // ── Birthday journey guard ────────────────────────────────────
  // Applies to every visitor. A locked (future) day can never be
  // revealed by typing its URL: the unlock check re-runs on every
  // request, in the recipient's timezone (Asia/Kolkata).
  if (path.startsWith("/birthday/day/")) {
    const day = Number(path.split("/")[3]);
    if (!Number.isInteger(day) || !isDayUnlocked(day)) {
      // Not unlocked yet — send them to the calendar instead of
      // leaking any future content.
      const url = new URL("/birthday/journey", req.url);
      if (currentUnlockedDay() > 0) url.searchParams.set("locked", day.toString());
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/birthday/day/:path*"],
};
