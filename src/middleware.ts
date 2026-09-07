import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
  const { role, clubStatus } = await getSessionInfo(req);
  const path = req.nextUrl.pathname;

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
  matcher: ["/admin/:path*", "/club/:path*"],
};
