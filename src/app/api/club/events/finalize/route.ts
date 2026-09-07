import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

/**
 * Event Finalization & Points Engine.
 *
 * POST body: { eventId, firstPlaceUserId?, secondPlaceUserId?, thirdPlaceUserId? }
 *
 * Closes the event permanently (isClosed + finalizedAt), records optional
 * 1st/2nd/3rd place winners, then in ONE atomic transaction:
 *   - credits each verified attendee participation points (+ winner bonus)
 *     to User.totalPoints and logs a PointTransaction,
 *   - credits the hosting club's points (base 50 + 2 per attendee) and logs it,
 *   - records each attendee's earned points on their Registration row.
 *
 * Only the event club's account or a SUPER_ADMIN may finalize. Winners must
 * be verified attendees.
 */
export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const eventId = typeof body?.eventId === "string" ? body.eventId : "";
    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        club: { select: { id: true } },
        registrations: {
          where: { status: "ATTENDED" },
          select: {
            id: true,
            userId: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // ── Authority: the event club's account or a SUPER_ADMIN ──
    if (currentUser.role !== "SUPER_ADMIN") {
      const isClubOwner =
        currentUser.role === "CLUB" && currentUser.clubId === event.clubId;

      if (!isClubOwner) {
        return NextResponse.json(
          { error: "You do not have permission to finalize this event." },
          { status: 403 }
        );
      }
    }

    if (event.isClosed) {
      return NextResponse.json(
        { error: "This event has already been finalized." },
        { status: 400 }
      );
    }

    const pickWinner = (v: unknown): string | null =>
      typeof v === "string" && v ? v : null;
    const firstPlaceUserId = pickWinner(body.firstPlaceUserId);
    const secondPlaceUserId = pickWinner(body.secondPlaceUserId);
    const thirdPlaceUserId = pickWinner(body.thirdPlaceUserId);

    // ── Validate winners: distinct, and must be verified attendees ──
    const attendeeIds = new Set(event.registrations.map((r) => r.userId));
    const winnerInputs = [firstPlaceUserId, secondPlaceUserId, thirdPlaceUserId].filter(
      (w): w is string => Boolean(w)
    );
    if (new Set(winnerInputs).size !== winnerInputs.length) {
      return NextResponse.json(
        { error: "Each winner must be a different student." },
        { status: 400 }
      );
    }
    for (const winnerId of winnerInputs) {
      if (!attendeeIds.has(winnerId)) {
        return NextResponse.json(
          { error: "Winners must be selected from verified attendees." },
          { status: 400 }
        );
      }
    }

    // ── Atomic points engine ──
    const result = await prisma.$transaction(async (tx) => {
      // Conditional close: only one concurrent finalization can match
      // isClosed: false — the loser gets count 0 and rolls back.
      const closed = await tx.event.updateMany({
        where: { id: eventId, isClosed: false },
        data: {
          isClosed: true,
          finalizedAt: new Date(),
          status: "COMPLETED",
          firstPlaceWinnerId: firstPlaceUserId,
          secondPlaceWinnerId: secondPlaceUserId,
          thirdPlaceWinnerId: thirdPlaceUserId,
        },
      });
      if (closed.count !== 1) {
        throw new Error("EVENT_ALREADY_FINALIZED");
      }

      // Individual student points: participation + winner bonus
      let studentPointsTotal = 0;
      for (const reg of event.registrations) {
        let addedPoints = event.pointsPerAttender || 10;
        let reason = "PARTICIPATION";

        if (reg.userId === firstPlaceUserId) {
          addedPoints += event.firstPlacePoints;
          reason = "PARTICIPATION + 1ST_PLACE";
        } else if (reg.userId === secondPlaceUserId) {
          addedPoints += event.secondPlacePoints;
          reason = "PARTICIPATION + 2ND_PLACE";
        } else if (reg.userId === thirdPlaceUserId) {
          addedPoints += event.thirdPlacePoints;
          reason = "PARTICIPATION + 3RD_PLACE";
        }

        await tx.user.update({
          where: { id: reg.userId },
          data: { totalPoints: { increment: addedPoints } },
        });
        await tx.registration.update({
          where: { id: reg.id },
          data: { pointsEarned: addedPoints },
        });
        await tx.pointTransaction.create({
          data: {
            userId: reg.userId,
            eventId,
            points: addedPoints,
            reason,
          },
        });
        studentPointsTotal += addedPoints;
      }

      // Club points: base hosting bonus + 2 per verified attendee
      const clubHostBonus = 50 + event.registrations.length * 2;
      await tx.club.update({
        where: { id: event.clubId },
        data: { points: { increment: clubHostBonus } },
      });
      await tx.pointTransaction.create({
        data: {
          clubId: event.clubId,
          eventId,
          points: clubHostBonus,
          reason: `HOSTED_EVENT (${event.registrations.length} Attendees)`,
        },
      });

      return {
        studentPointsTotal,
        clubHostBonus,
        attendeeCount: event.registrations.length,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Event finalized successfully! Points and leaderboards updated.",
      ...result,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "EVENT_ALREADY_FINALIZED") {
      return NextResponse.json(
        { error: "This event has already been finalized." },
        { status: 400 }
      );
    }
    console.error("Finalization Error:", err);
    return NextResponse.json(
      { error: "Failed to finalize event" },
      { status: 500 }
    );
  }
}
