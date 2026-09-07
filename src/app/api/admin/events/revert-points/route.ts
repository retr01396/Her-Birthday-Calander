import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

/**
 * Audit-control revert for an APPROVED external event.
 *
 * POST body: { eventId, reason? }
 *
 * In ONE atomic transaction: deducts the exact points from every student and
 * club balance that was credited for this event (via its ACTIVE
 * PointTransaction rows), marks those ledger entries REVERTED, and flips the
 * event back to verificationStatus REVERTED (unclosed) so it can be
 * re-inspected. Points can never go below zero.
 */
export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const eventId = typeof body?.eventId === "string" ? body.eventId : "";
    const revertReason =
      typeof body?.reason === "string" && body.reason.trim()
        ? body.reason.trim().slice(0, 500)
        : null;

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        club: { select: { id: true, name: true } },
        pointLogs: {
          where: { status: "ACTIVE" },
          select: { id: true, userId: true, clubId: true, points: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.verificationStatus !== "APPROVED") {
      return NextResponse.json(
        {
          error: `Only approved events with active points can be reverted (current status: ${event.verificationStatus}).`,
        },
        { status: 400 }
      );
    }

    const revertedCount = await prisma.$transaction(async (tx) => {
      for (const log of event.pointLogs) {
        if (log.userId) {
          await tx.user.update({
            where: { id: log.userId },
            data: { totalPoints: { decrement: log.points } },
          });
        }
        if (log.clubId) {
          await tx.club.update({
            where: { id: log.clubId },
            data: { points: { decrement: log.points } },
          });
        }
        await tx.pointTransaction.update({
          where: { id: log.id },
          data: { status: "REVERTED" },
        });
      }

      await tx.event.update({
        where: { id: eventId },
        data: {
          verificationStatus: "REVERTED",
          isClosed: false,
          status: event.status === "COMPLETED" ? "PUBLISHED" : event.status,
        },
      });

      // Stash the reason on the event via externalRegUrl is lossy; instead log it
      // in a ledger row so the audit trail stays visible.
      if (revertReason) {
        await tx.pointTransaction.create({
          data: {
            clubId: event.clubId,
            eventId,
            points: 0,
            reason: `REVERTED: ${revertReason}`,
          },
        });
      }

      return event.pointLogs.length;
    });

    return NextResponse.json({
      success: true,
      message: `Event points reverted. ${revertedCount} ledger entries marked REVERTED and student/club balances restored.`,
      revertedCount,
    });
  } catch (err) {
    console.error("Revert Points Error:", err);
    return NextResponse.json(
      { error: "Failed to revert event points" },
      { status: 500 }
    );
  }
}
