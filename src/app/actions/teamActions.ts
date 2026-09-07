"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

/**
 * Helper to generate a unique join code
 */
function generateJoinCode(length: number = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed 0, O, 1, I
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createTeam(eventId: string, teamName: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized: Please sign in.");

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) throw new Error("Event not found.");
  if (!event.isTeamEvent) throw new Error("This is not a team event.");

  const joinCode = generateJoinCode();

  // In a transaction, create team and add captain as first member
  const result = await prisma.$transaction(async (tx) => {
    // Check if user is registered for the event
    const registration = await tx.registration.findUnique({
      where: { userId_eventId: { userId: user.id, eventId: eventId } }
    });
    if (!registration) throw new Error("You must register for the event first.");

    // Check if user is already in a team for this event
    const existingMembership = await tx.teamMember.findFirst({
      where: {
        userId: user.id,
        team: { eventId },
      },
    });

    if (existingMembership) {
      throw new Error("You are already in a team for this event.");
    }
    
    // Check if team name is taken for this event
    const existingTeam = await tx.team.findUnique({
      where: { eventId_name: { eventId, name: teamName } },
    });
    if (existingTeam) {
        throw new Error("Team name is already taken for this event.");
    }

    const team = await tx.team.create({
      data: {
        name: teamName,
        eventId,
        leaderId: user.id,
        joinCode,
        members: {
          create: {
            userId: user.id,
          },
        },
      },
      include: {
        members: { include: { user: true } },
      },
    });

    return team;
  });

  return { team: result, joinCode };
}

export async function joinTeamByCode(joinCode: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized: Please sign in.");

  const result = await prisma.$transaction(async (tx) => {
    const team = await tx.team.findUnique({
      where: { joinCode },
      include: {
        event: true,
        members: true,
      },
    });

    if (!team) throw new Error("Invalid join code.");
    if (team.members.length >= team.event.maxTeamSize) {
      throw new Error("Team is already full.");
    }

    // Check if user is registered for the event
    const registration = await tx.registration.findUnique({
      where: { userId_eventId: { userId: user.id, eventId: team.eventId } }
    });
    if (!registration) throw new Error("You must register for the event first.");

    const existingMembership = await tx.teamMember.findFirst({
      where: {
        userId: user.id,
        team: { eventId: team.eventId },
      },
    });

    if (existingMembership) {
      throw new Error("You are already in a team for this event.");
    }

    const updatedTeam = await tx.team.update({
      where: { id: team.id },
      data: {
        members: {
          create: {
            userId: user.id,
          },
        },
      },
      include: {
        event: true,
        leader: true,
        members: { include: { user: true } },
      },
    });

    return updatedTeam;
  });

  return { teamName: result.name, leaderName: result.leader.name, team: result };
}

export async function submitTeamPassUrl(teamId: string, passUrl: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized: Please sign in.");

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { event: true, members: true },
  });

  if (!team) throw new Error("Team not found.");
  
  if (team.event.passStrategy === "CAPTAIN_ONLY") {
    if (team.leaderId !== user.id) {
      throw new Error("Only team captains can submit team pass links.");
    }
    await prisma.team.update({
      where: { id: team.id },
      data: { externalPassUrl: passUrl.trim() },
    });
  } else if (team.event.passStrategy === "INDIVIDUAL") {
    const member = team.members.find(m => m.userId === user.id);
    if (!member) throw new Error("You are not a member of this team.");
    await prisma.teamMember.update({
      where: { id: member.id },
      data: { externalPassUrl: passUrl.trim() },
    });
  }

  return { success: true };
}
