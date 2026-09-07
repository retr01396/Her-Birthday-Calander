"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";

// ─── Types ───────────────────────────────────────────────────────────────────

export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";

export type UpdateEventInput = {
  title?: string;
  description?: string;
  location?: string;
  startTime?: string; // ISO date string from the form
  endTime?: string | null;
  capacity?: number;
  showCapacityLimit?: boolean;
  imageUrl?: string | null;
  passType?: string;
  status?: EventStatus;
  registrationFee?: number;
};

// ─── Authorization Helper ────────────────────────────────────────────────────

/**
 * Resolve the current user and verify they manage the event's club.
 * Returns the event (with club slug) when authorized, otherwise throws.
 */
async function assertEventAccess(eventId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error("Unauthorized: You must be logged in.");
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      club: { select: { id: true, slug: true } },
    },
  });

  if (!event) {
    throw new Error("Event not found.");
  }

  if (currentUser.role !== "SUPER_ADMIN") {
    // Only the club's own account may manage its events.
    const isClubOwner =
      currentUser.role === "CLUB" && currentUser.clubId === event.clubId;

    if (!isClubOwner) {
      throw new Error(
        "Unauthorized: Only the club account or an admin can manage this event."
      );
    }
  }

  return { event };
}

/** Revalidate every surface that displays this event. */
function revalidateEvent(clubSlug: string | null, eventId: string) {
  revalidatePath("/");
  revalidatePath("/clubs");
  if (clubSlug) revalidatePath(`/clubs/${clubSlug}`);
  revalidatePath("/club/dashboard");
  revalidatePath(`/club/dashboard/events/${eventId}/responses`);
  revalidatePath(`/club/dashboard/events/${eventId}/form-builder`);
  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/register`);
  revalidatePath("/");
}

// ─── Action 1: Update Event ─────────────────────────────────────────────────

/**
 * Update an event's details, banner, schedule, capacity, fee and status.
 * Only the club's LEADER or a SUPER_ADMIN can do this.
 */
export async function updateEvent(eventId: string, input: UpdateEventInput) {
  const { event } = await assertEventAccess(eventId);

  // ── Validation ──
  if (input.title !== undefined && !input.title.trim()) {
    throw new Error("Event title is required.");
  }
  if (input.location !== undefined && !input.location.trim()) {
    throw new Error("Location is required.");
  }
  if (input.description !== undefined && !input.description.trim()) {
    throw new Error("Description is required.");
  }

  const startTime = input.startTime ? new Date(input.startTime) : undefined;
  // Explicit null means the user cleared the end date; undefined means "not provided".
  const endTime = input.endTime ? new Date(input.endTime) : undefined;

  if (startTime && isNaN(startTime.getTime())) {
    throw new Error("Invalid start date.");
  }
  if (endTime && isNaN(endTime.getTime())) {
    throw new Error("Invalid end date.");
  }
  if (
    startTime &&
    endTime &&
    endTime.getTime() < startTime.getTime()
  ) {
    throw new Error("End date cannot be earlier than the start date.");
  }
  if (input.capacity !== undefined && (isNaN(input.capacity) || input.capacity < 1)) {
    throw new Error("Capacity must be at least 1.");
  }
  if (input.registrationFee !== undefined && input.registrationFee < 0) {
    throw new Error("Registration fee cannot be negative.");
  }

  const resolvedStart = startTime ?? event.startTime;

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: {
      title: input.title,
      description: input.description,
      location: input.location,
      // Canonical columns (used across the app)
      startTime: resolvedStart,
      endTime: input.endTime === null ? null : endTime ?? event.endTime,
      capacity: input.capacity,
      showCapacityLimit: input.showCapacityLimit,
      imageUrl: input.imageUrl,
      passType: input.passType,
      status: input.status,
      registrationFee: input.registrationFee,
      // Legacy mirror columns (kept in sync with the canonical ones)
      startDate: resolvedStart,
      totalSeats: input.capacity,
    },
    include: {
      club: { select: { id: true, slug: true } },
    },
  });

  revalidateEvent(updated.club.slug, eventId);

  return updated;
}

// ─── Action 2: Toggle Registration Status ───────────────────────────────────

/**
 * Open or close registrations for an event without editing full details.
 * Only the club's LEADER or a SUPER_ADMIN can do this.
 */
export async function toggleEventRegistrationStatus(
  eventId: string,
  isOpen: boolean
) {
  const { event } = await assertEventAccess(eventId);

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: { registrationOpen: isOpen },
    select: { id: true, registrationOpen: true },
  });

  revalidateEvent(event.club.slug, eventId);

  return updated;
}

// ─── Action 3: Delete / Cancel Event ────────────────────────────────────────

/**
 * Permanently delete an event.
 * Guard: events with registrations cannot be hard-deleted — cancel them
 * instead so attendee records and passes remain intact for auditing.
 * Only the club's LEADER or a SUPER_ADMIN can do this.
 */
export async function deleteEvent(eventId: string) {
  const { event } = await assertEventAccess(eventId);

  const registrationCount = await prisma.registration.count({
    where: { eventId },
  });

  if (registrationCount > 0) {
    throw new Error(
      `Cannot delete: ${registrationCount} student(s) are registered for this event. Cancel the event instead — registrations and passes stay preserved.`
    );
  }

  // External events can be approved without any Registration rows — a hard
  // delete would cascade-remove the PointTransaction ledger and destroy the
  // audit trail. Block deletion once points exist; cancel instead.
  const pointLogCount = await prisma.pointTransaction.count({
    where: { eventId },
  });
  if (pointLogCount > 0) {
    throw new Error(
      `Cannot delete: this event has ${pointLogCount} point transaction(s) on record. Cancel it instead to preserve the audit ledger.`
    );
  }

  await prisma.event.delete({ where: { id: eventId } });

  revalidateEvent(event.club.slug, eventId);

  return { success: true };
}

// ─── Action 4: Mark Attendance ──────────────────────────────────────────────

/**
 * Scan a student's QR code and mark them as ATTENDED.
 *
 * Attendance is recorded here; POINTS are NOT awarded at scan time — the
 * Event Finalization engine (src/app/api/club/events/finalize) credits
 * participation + winner bonuses atomically when the club closes the event,
 * so attendees are never double-awarded.
 *
 * Only the club's LEADER or a SUPER_ADMIN can do this. A finalized (closed)
 * event refuses new scans permanently.
 */
export async function markAttendance(qrToken: string, eventId: string) {
  const { event } = await assertEventAccess(eventId);

  if (event.isClosed) {
    throw new Error(
      "This event has been finalized — attendance scanning is locked."
    );
  }

  const registration = await prisma.registration.findUnique({
    where: { qrToken },
    include: { user: true },
  });

  if (!registration) {
    throw new Error("Invalid QR code: Registration not found.");
  }

  if (registration.eventId !== eventId) {
    throw new Error("Invalid QR code: Pass is for a different event.");
  }

  if (registration.status === "ATTENDED") {
    throw new Error("Attendance already recorded for this student!");
  }

  // Only approved applicants hold a valid pass. PENDING applications get a
  // QR token at creation but must never scan until the club approves them.
  if (registration.status !== "REGISTERED") {
    throw new Error(
      "This pass is not valid — the student's application has not been approved."
    );
  }

  await prisma.registration.update({
    where: { id: registration.id },
    data: {
      status: "ATTENDED",
      attendedAt: new Date(),
    },
  });

  const externalCode = registration.formResponses ? (registration.formResponses as any).externalPassCode : null;

  return {
    success: true,
    message: `Attendance verified for ${registration.user.name}`,
    studentName: registration.user.name,
    studentEmail: registration.user.email,
    externalPassCode: externalCode,
  };
}

// ─── Action 5: Get User Registration Status ─────────────────────────────────

/**
 * Check if the currently logged in user is registered for an event
 * Returns the registration details including the qrToken if registered.
 */
export async function getUserRegistrationStatus(eventId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;

  const registration = await prisma.registration.findUnique({
    where: {
      userId_eventId: {
        userId: currentUser.id,
        eventId,
      },
    },
    select: {
      id: true,
      qrToken: true,
      status: true,
    },
  });

  return registration;
}

// ─── Action 6: Register for an Individual Event ─────────────────────────────

/**
 * Register the current student for a non-team event and generate their pass.
 */
export async function registerForIndividualEvent(eventId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error("You must be logged in.");
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error("Event not found.");
  if (event.isClosed) throw new Error("This event has been finalized.");
  if (!event.registrationOpen) {
    throw new Error("Registrations are closed for this event.");
  }
  if (event.isTeamEvent) {
    throw new Error("This is a team event — create or join a team instead.");
  }
  if (event.requiresApproval) {
    throw new Error(
      "This event uses application-based selection — submit the application form instead of claiming a pass."
    );
  }

  const registration = await prisma.$transaction(async (tx) => {
    // Lock the event row so concurrent registrations serialize on capacity.
    await tx.$queryRaw`SELECT id FROM "Event" WHERE id = ${eventId} FOR UPDATE`;

    const existing = await tx.registration.findUnique({
      where: { userId_eventId: { userId: currentUser.id, eventId } },
    });
    if (existing) throw new Error("You are already registered for this event.");

    // Enforce capacity (0 / negative means unlimited — legacy events).
    if (event.capacity > 0) {
      const registered = await tx.registration.count({ where: { eventId } });
      if (registered >= event.capacity) {
        throw new Error("Registration failed: Event is at full capacity.");
      }
    }

    const created = await tx.registration.create({
      data: { userId: currentUser.id, eventId },
    });

    // Auto-close registrations when the last seat is taken.
    if (event.capacity > 0) {
      const registered = await tx.registration.count({ where: { eventId } });
      if (registered >= event.capacity) {
        await tx.event.update({
          where: { id: eventId },
          data: { registrationOpen: false },
        });
      }
    }

    return created;
  });

  return { registration };
}

// ─── Team Code Helper ───────────────────────────────────────────────────────

const TEAM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

function generateTeamCode(): string {
  return Array.from(
    { length: 6 },
    () => TEAM_CODE_ALPHABET[Math.floor(Math.random() * TEAM_CODE_ALPHABET.length)]
  ).join("");
}

// ─── Action 7: Create a Team ────────────────────────────────────────────────

/**
 * Create a team for a team event. The creator becomes the leader, gets added
 * as a member, and receives a Registration (pass) in one transaction.
 */
export async function createEventTeam({
  eventId,
  teamName,
}: {
  eventId: string;
  teamName: string;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error("You must be logged in.");
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error("Event not found.");
  if (!event.isTeamEvent) {
    throw new Error("This event does not support teams.");
  }
  if (event.isClosed) throw new Error("This event has been finalized.");
  if (!event.registrationOpen) {
    throw new Error("Registrations are closed for this event.");
  }

  const trimmedName = teamName.trim();
  if (!trimmedName) {
    throw new Error("Team name is required.");
  }
  if (trimmedName.length > 40) {
    throw new Error("Team name must be 40 characters or fewer.");
  }

  const existing = await prisma.registration.findUnique({
    where: { userId_eventId: { userId: currentUser.id, eventId } },
  });
  if (existing) {
    throw new Error("You are already registered for this event.");
  }

  // Retry on the (astronomically rare) invite-code collision. Codes are
  // generated with a 32-char alphabet; on P2002 for the code index we simply
  // generate another code and try again.
  const MAX_CODE_ATTEMPTS = 5;
  let team;
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
    try {
      const code = generateTeamCode();
      team = await prisma.$transaction(async (tx) => {
        // Lock the event row so concurrent team creations serialize on capacity.
        await tx.$queryRaw`SELECT id FROM "Event" WHERE id = ${eventId} FOR UPDATE`;

        if (event.capacity > 0) {
          const registered = await tx.registration.count({ where: { eventId } });
          if (registered >= event.capacity) {
            throw new Error("Registration failed: Event is at full capacity.");
          }
        }

        const created = await tx.team.create({
          data: { name: trimmedName, joinCode: code, eventId, leaderId: currentUser.id },
        });
        await tx.teamMember.create({
          data: { teamId: created.id, userId: currentUser.id },
        });
        await tx.registration.create({
          data: { userId: currentUser.id, eventId },
        });

        // Auto-close registrations when the last seat is taken.
        if (event.capacity > 0) {
          const registered = await tx.registration.count({ where: { eventId } });
          if (registered >= event.capacity) {
            await tx.event.update({
              where: { id: eventId },
              data: { registrationOpen: false },
            });
          }
        }

        return created;
      });
      break;
    } catch (err: any) {
      const isCodeCollision =
        err?.code === "P2002" &&
        String(err?.meta?.target ?? "").includes("joinCode");
      if (isCodeCollision && attempt < MAX_CODE_ATTEMPTS - 1) continue;
      throw err;
    }
  }

  return { team: { id: team!.id, teamName: team!.name }, inviteCode: team!.joinCode };
}

// ─── Action 8: Join a Team by Invite Code ──────────────────────────────────

/**
 * Join a team by its invite code (scoped to the event). Adds the member and
 * creates their Registration (pass). Rejects full teams and duplicates.
 */
export async function joinEventTeam({
  eventId,
  inviteCode,
}: {
  eventId: string;
  inviteCode: string;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error("You must be logged in.");
  }

  const team = await prisma.team.findUnique({
    where: { joinCode: inviteCode.trim().toUpperCase() },
    include: {
      event: true,
      leader: { select: { name: true } },
    },
  });

  if (!team) throw new Error("Invalid team code.");
  if (team.eventId !== eventId) {
    throw new Error("This team is not registered for this event.");
  }
  if (team.event.isClosed) {
    throw new Error("This event has been finalized.");
  }
  if (!team.event.registrationOpen) {
    throw new Error("Registrations are closed for this event.");
  }

  try {
    // Race-safe join: lock the team row so two concurrent joins when only one
    // slot remains serialize — the second transaction re-counts after the
    // first commits and is rejected instead of overfilling the team.
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Team" WHERE id = ${team.id} FOR UPDATE`;

      const memberCount = await tx.teamMember.count({ where: { teamId: team.id } });
      if (memberCount >= team.event.maxTeamSize) {
        throw new Error("Team is already full.");
      }

      const existing = await tx.registration.findUnique({
        where: { userId_eventId: { userId: currentUser.id, eventId } },
      });
      if (existing) {
        throw new Error("You are already registered for this event.");
      }

      if (team.event.capacity > 0) {
        const registered = await tx.registration.count({ where: { eventId } });
        if (registered >= team.event.capacity) {
          throw new Error("Registration failed: Event is at full capacity.");
        }
      }

      await tx.teamMember.create({
        data: { teamId: team.id, userId: currentUser.id },
      });
      await tx.registration.create({
        data: { userId: currentUser.id, eventId },
      });

      // Auto-close registrations when the last seat is taken.
      if (team.event.capacity > 0) {
        const registered = await tx.registration.count({ where: { eventId } });
        if (registered >= team.event.capacity) {
          await tx.event.update({
            where: { id: eventId },
            data: { registrationOpen: false },
          });
        }
      }
    });
  } catch (err: any) {
    // Two rapid submissions from the same user race the unique constraints.
    if (err?.code === "P2002") {
      throw new Error("You are already registered for this event.");
    }
    throw err;
  }

  return { teamName: team.name, leaderName: team.leader.name };
}

/**
 * Toggle attendance for a registered student.
 * Clubs can check/uncheck students as attended from their dashboard.
 */
export async function toggleAttendance(registrationId: string, attended: boolean) {
  const reg = await prisma.registration.findUnique({
    where: { id: registrationId },
    select: { eventId: true },
  });
  if (!reg) {
    throw new Error("Registration not found.");
  }

  const { event } = await assertEventAccess(reg.eventId);

  if (event.isClosed) {
    throw new Error("This event has been finalized and is locked.");
  }

  const updated = await prisma.registration.update({
    where: { id: registrationId },
    data: {
      status: attended ? "ATTENDED" : "REGISTERED",
      attendedAt: attended ? new Date() : null,
    },
  });

  revalidateEvent(event.club.slug, reg.eventId);

  return updated;
}

// ─── Action 9: Claim External Pass ──────────────────────────────────────────

export async function claimExternalPass({ eventId, passUrl }: { eventId: string; passUrl: string }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error("You must be logged in.");
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error("Event not found.");
  if (event.regType !== "EXTERNAL") {
    throw new Error("This is not an external event.");
  }
  if (event.isClosed) throw new Error("This event has been finalized.");
  if (!event.registrationOpen) {
    throw new Error("Registrations are closed for this event.");
  }

  const trimmedUrl = passUrl.trim();
  if (!trimmedUrl) {
    throw new Error("Pass URL is required.");
  }

  const registration = await prisma.$transaction(async (tx) => {
    // Lock the event row so concurrent registrations serialize on capacity.
    await tx.$queryRaw`SELECT id FROM "Event" WHERE id = ${eventId} FOR UPDATE`;

    const existingUser = await tx.registration.findUnique({
      where: { userId_eventId: { userId: currentUser.id, eventId } }
    });
    if (existingUser) {
      throw new Error("You are already registered for this event.");
    }

    // Check if the external pass code has already been claimed for this event
    const claimedCount = await tx.$queryRaw<{ cnt: bigint }[]>`
      SELECT count(id) as cnt FROM "Registration" 
      WHERE "eventId" = ${eventId} 
      AND "formResponses"->>'passUrl' = ${trimmedUrl}
    `;
    if (Number(claimedCount[0].cnt) > 0) {
      throw new Error("This pass URL has already been claimed for this event.");
    }

    // Enforce capacity (0 / negative means unlimited — legacy events).
    if (event.capacity > 0) {
      const registered = await tx.registration.count({ where: { eventId } });
      if (registered >= event.capacity) {
        throw new Error("Registration failed: Event is at full capacity.");
      }
    }

    const created = await tx.registration.create({
      data: { 
        userId: currentUser.id, 
        eventId,
        formResponses: { passUrl: trimmedUrl }
      },
    });

    // Auto-close registrations when the last seat is taken.
    if (event.capacity > 0) {
      const registered = await tx.registration.count({ where: { eventId } });
      if (registered >= event.capacity) {
        await tx.event.update({
          where: { id: eventId },
          data: { registrationOpen: false },
        });
      }
    }

    return created;
  });

  return { registration };
}
