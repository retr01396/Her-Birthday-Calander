import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getCurrentUser();

    return NextResponse.json({
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            onboardingCompleted: user.onboardingCompleted,
            clubStatus: user.clubStatus ?? null,
          }
        : null,
    });
  } catch (err) {
    console.error("[auth/me] error:", err);
    // Treat auth failures as unauthenticated so middleware never 500s.
    return NextResponse.json({ user: null });
  }
}
