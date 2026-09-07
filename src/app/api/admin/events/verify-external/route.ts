import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

/**
 * Admin verification of a club-submitted EXTERNAL event (MakeMyPass / Google
 * Forms / offline sheets).
 *
 * POST body: { eventId }
 *
 * In ONE atomic transaction: flags the event APPROVED (and closes it), then for
 * every uploaded attendee whose email matches a registered student, credits
 * User.totalPoints (base participation + winner bonus) and logs a
 * PointTransaction. The host club gets its hosting bonus (50 + 2 per matched
 * attendee). Emails that don't match any account are skipped — the response
 * reports the matched/unmatched split.
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

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        club: { select: { id: true, name: true } },
        externalAttendees: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.verificationStatus !== "PENDING_ADMIN_VERIFICATION") {
      return NextResponse.json(
        {
          error: `Event is not awaiting verification (current status: ${event.verificationStatus}).`,
        },
        { status: 400 }
      );
    }

    // Winners must be unique — at most one 1ST, one 2ND, one 3RD per event.
    const rankCounts: Record<string, number> = { "1ST": 0, "2ND": 0, "3RD": 0 };
    for (const attendee of event.externalAttendees) {
      if (rankCounts[attendee.position] !== undefined) {
        rankCounts[attendee.position] += 1;
      }
    }
    const dupRank = (Object.keys(rankCounts) as Array<keyof typeof rankCounts>).find(
      (k) => rankCounts[k] > 1
    );
    if (dupRank) {
      return NextResponse.json(
        { error: `Multiple ${dupRank} place winners found — only one per position is allowed.` },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Atomic conditional claim: a concurrent approval can't double-credit.
      const claimed = await tx.event.updateMany({
        where: { id: eventId, verificationStatus: "PENDING_ADMIN_VERIFICATION" },
        data: {
          verificationStatus: "APPROVED",
          isClosed: true,
          finalizedAt: new Date(),
          status: "COMPLETED",
        },
      });
      if (claimed.count !== 1) {
        throw new Error("EVENT_ALREADY_PROCESSED");
      }

      const positionBonus: Record<string, number> = {
        PARTICIPANT: 0,
        "1ST": 50,
        "2ND": 30,
        "3RD": 20,
      };

      let matchedCount = 0;
      let studentPointsTotal = 0;
      const unmatched: string[] = [];

      for (const attendee of event.externalAttendees) {
        const student = await tx.user.findUnique({
          where: { email: attendee.email.trim().toLowerCase() },
          select: { id: true },
        });

        if (!student) {
          unmatched.push(attendee.email);
          continue;
        }

        matchedCount += 1;
        const addedPoints =
          (event.pointsPerAttender || 10) + (positionBonus[attendee.position] ?? 0);
        studentPointsTotal += addedPoints;

        await tx.externalAttendee.update({
          where: { id: attendee.id },
          data: { isMatched: true },
        });
        await tx.user.update({
          where: { id: student.id },
          data: { totalPoints: { increment: addedPoints } },
        });
        await tx.pointTransaction.create({
          data: {
            userId: student.id,
            eventId,
            points: addedPoints,
            reason:
              attendee.position === "PARTICIPANT"
                ? "EXTERNAL ATTENDANCE"
                : `EXTERNAL ATTENDANCE + ${attendee.position}_PLACE`,
          },
        });
      }

      // Host club bonus: 50 base + 2 per matched attendee
      const clubBonus = 50 + matchedCount * 2;
      await tx.club.update({
        where: { id: event.clubId },
        data: { points: { increment: clubBonus } },
      });
      await tx.pointTransaction.create({
        data: {
          clubId: event.clubId,
          eventId,
          points: clubBonus,
          reason: `HOSTED_EXTERNAL_EVENT (${matchedCount} Matched)`,
        },
      });

      return {
        matchedCount,
        unmatchedCount: unmatched.length,
        unmatched,
        studentPointsTotal,
        clubBonus,
      };
    });

    return NextResponse.json({
      success: true,
      message: "External event approved. Points credited to matched students and the hosting club.",
      ...result,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "EVENT_ALREADY_PROCESSED") {
      return NextResponse.json(
        { error: "This event was already approved or processed." },
        { status: 400 }
      );
    }
    console.error("Verify External Error:", err);
    return NextResponse.json(
      { error: "Failed to verify external event" },
      { status: 500 }
    );
  }
}
