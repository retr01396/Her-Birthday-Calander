import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

/**
 * Admin rejects a club-submitted external event. No points are credited.
 * POST body: { eventId }
 */
export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const eventId = typeof body?.eventId === "string" ? body.eventId : "";
    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const updated = await prisma.event.updateMany({
      where: { id: eventId, verificationStatus: "PENDING_ADMIN_VERIFICATION" },
      data: { verificationStatus: "REJECTED" },
    });

    if (updated.count !== 1) {
      return NextResponse.json(
        { error: "Event not found or not awaiting verification." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "External event submission rejected. No points were credited.",
    });
  } catch (err) {
    console.error("Reject External Error:", err);
    return NextResponse.json(
      { error: "Failed to reject external event" },
      { status: 500 }
    );
  }
}
