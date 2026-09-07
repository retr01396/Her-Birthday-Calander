import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

/**
 * Team Event Finalization & Equal Points Distribution.
 *
 * POST body: { eventId, firstPlaceTeamId?, secondPlaceTeamId?, thirdPlaceTeamId? }
 *
 * Closes the event permanently, records the winning TEAMS, then in one atomic
 * transaction distributes EQUAL points to every VERIFIED (attended) member of
 * every team: base participation points + the winning team's bonus per member.
 * The hosting club receives its turnout bonus (50 + 2 per verified participant).
 *
 * Only the event club's account or a SUPER_ADMIN may finalize. Winner teams
 * must belong to the event.
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
        teams: {
          include: {
            members: {
              include: { user: { select: { id: true, name: true } } },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    if (!event.isTeamEvent) {
      return NextResponse.json(
        { error: "This is not a team event." },
        { status: 400 }
      );
    }
    if (event.isClosed) {
      return NextResponse.json(
        { error: "This event has already been finalized." },
        { status: 400 }
      );
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

    const pickTeam = (v: unknown): string | null =>
      typeof v === "string" && v ? v : null;
    const firstPlaceTeamId = pickTeam(body.firstPlaceTeamId);
    const secondPlaceTeamId = pickTeam(body.secondPlaceTeamId);
    const thirdPlaceTeamId = pickTeam(body.thirdPlaceTeamId);

    // ── Validate winners: distinct, belong to this event ──
    const eventTeamIds = new Set(event.teams.map((t) => t.id));
    const winnerInputs = [
      firstPlaceTeamId,
      secondPlaceTeamId,
      thirdPlaceTeamId,
    ].filter((w): w is string => Boolean(w));
    if (new Set(winnerInputs).size !== winnerInputs.length) {
      return NextResponse.json(
        { error: "Each winning team must be different." },
        { status: 400 }
      );
    }
    for (const teamId of winnerInputs) {
      if (!eventTeamIds.has(teamId)) {
        return NextResponse.json(
          { error: "Winning teams must belong to this event." },
          { status: 400 }
        );
      }
    }

    // Attended members per team: a member is verified if they have an
    // ATTENDED registration for this event (QR check-in).
    const attendedRegs = await prisma.registration.findMany({
      where: { eventId, status: "ATTENDED" },
      select: { userId: true, id: true },
    });
    const attendedByUser = new Map(
      attendedRegs.map((r) => [r.userId, r.id])
    );

    // ── Atomic equal-points engine ──
    const result = await prisma.$transaction(async (tx) => {
      // Conditional close: only one concurrent finalization can match
      // isClosed: false — the loser gets count 0 and rolls back.
      const closed = await tx.event.updateMany({
        where: { id: eventId, isClosed: false },
        data: {
          isClosed: true,
          finalizedAt: new Date(),
          status: "COMPLETED",
          firstPlaceTeamId,
          secondPlaceTeamId,
          thirdPlaceTeamId,
        },
      });
      if (closed.count !== 1) {
        throw new Error("EVENT_ALREADY_FINALIZED");
      }

      let studentPointsTotal = 0;
      let verifiedParticipants = 0;

      for (const team of event.teams) {
        let positionBonus = 0;
        let reason = "EVENT_ATTENDANCE";

        if (team.id === firstPlaceTeamId) {
          positionBonus = event.firstPlacePoints;
          reason = "1ST_PLACE_TEAM";
        } else if (team.id === secondPlaceTeamId) {
          positionBonus = event.secondPlacePoints;
          reason = "2ND_PLACE_TEAM";
        } else if (team.id === thirdPlaceTeamId) {
          positionBonus = event.thirdPlacePoints;
          reason = "3RD_PLACE_TEAM";
        }

        for (const member of team.members) {
          const registrationId = attendedByUser.get(member.userId);
          if (!registrationId) continue; // only verified attendees earn points

          const pointsPerMember = (event.pointsPerAttender || 10) + positionBonus;

          await tx.user.update({
            where: { id: member.userId },
            data: { totalPoints: { increment: pointsPerMember } },
          });
          await tx.registration.update({
            where: { id: registrationId },
            data: { pointsEarned: pointsPerMember },
          });
          await tx.pointTransaction.create({
            data: {
              userId: member.userId,
              eventId,
              points: pointsPerMember,
              reason,
            },
          });
          studentPointsTotal += pointsPerMember;
          verifiedParticipants += 1;
        }
      }

      // Club turnout bonus based on total verified participants
      const clubHostBonus = 50 + verifiedParticipants * 2;
      await tx.club.update({
        where: { id: event.clubId },
        data: { points: { increment: clubHostBonus } },
      });
      await tx.pointTransaction.create({
        data: {
          clubId: event.clubId,
          eventId,
          points: clubHostBonus,
          reason: `HOSTED_EVENT (${verifiedParticipants} Participants)`,
        },
      });

      return { studentPointsTotal, clubHostBonus, verifiedParticipants };
    });

    return NextResponse.json({
      success: true,
      message: "Team event finalized — equal points distributed!",
      ...result,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "EVENT_ALREADY_FINALIZED") {
      return NextResponse.json(
        { error: "This event has already been finalized." },
        { status: 400 }
      );
    }
    console.error("Team Finalization Error:", err);
    return NextResponse.json(
      { error: "Failed to finalize team event" },
      { status: 500 }
    );
  }
}
