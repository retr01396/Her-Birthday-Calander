"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

export type AttendeePosition = "PARTICIPANT" | "1ST" | "2ND" | "3RD";

export interface ExternalAttendeeInput {
  email: string;
  name?: string;
  position?: string; // PARTICIPANT | 1ST | 2ND | 3RD (or 1/2/3 / first/second/third)
}

const VALID_POSITIONS = new Set<AttendeePosition>([
  "PARTICIPANT",
  "1ST",
  "2ND",
  "3RD",
]);

/** Normalize loose CSV values ("1", "FIRST", "1st place") to 1ST/2ND/3RD/PARTICIPANT. */
function normalizePosition(raw?: string): AttendeePosition {
  const value = (raw || "").trim().toUpperCase();
  if (value === "1" || value === "FIRST" || value === "1ST" || value === "GOLD" || value === "WINNER") return "1ST";
  if (value === "2" || value === "SECOND" || value === "2ND" || value === "SILVER") return "2ND";
  if (value === "3" || value === "THIRD" || value === "3RD" || value === "BRONZE") return "3RD";
  return "PARTICIPANT";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ATTENDEES = 1000;

/**
 * Club submits an EXTERNAL event's attendance list (MakeMyPass / Google Forms /
 * offline sheet). The rows are stored as ExternalAttendee records on an event
 * and the event is flagged PENDING_ADMIN_VERIFICATION — NO points are credited
 * until an admin approves via /api/admin/events/verify-external.
 *
 * Clubs can attach the list to one of their existing events, or (no eventId)
 * the action auto-creates a lightweight event for "General Club Activity".
 */
export async function submitExternalAttendance(input: {
  clubId?: string;
  eventId?: string;
  eventTitle?: string;
  externalRegUrl?: string;
  csvFileUrl: string;
  attendees: ExternalAttendeeInput[];
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");

  // Resolve the submitting club: club account owns itself, SUPER_ADMIN may pick.
  let targetClubId = input.clubId;
  if (user.role === "CLUB") {
    if (!user.clubId) throw new Error("No club assigned to this account.");
    targetClubId = user.clubId;
  }
  if (user.role !== "CLUB" && user.role !== "SUPER_ADMIN") {
    throw new Error("Only club accounts can submit external attendance.");
  }
  if (!targetClubId) throw new Error("Club ID is required.");

  const attendees = (input.attendees || [])
    .map((a) => ({
      email: (a.email || "").trim().toLowerCase(),
      name: (a.name || "").trim() || null,
      position: normalizePosition(a.position),
    }))
    .filter((a) => EMAIL_RE.test(a.email));

  if (attendees.length === 0) {
    throw new Error("No valid attendee emails were found in the CSV.");
  }
  if (attendees.length > MAX_ATTENDEES) {
    throw new Error(`Attendance lists are capped at ${MAX_ATTENDEES} entries.`);
  }

  const uniqueEmails = new Set(attendees.map((a) => a.email));
  if (uniqueEmails.size !== attendees.length) {
    throw new Error("Duplicate emails found in the attendance list.");
  }

  if (!input.csvFileUrl) {
    throw new Error("CSV content is required for the audit trail.");
  }

  const now = new Date();

  // ── Resolve or create the event ───────────────────────────────────────────
  let eventId = input.eventId;
  if (eventId) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new Error("Event not found.");
    if (event.clubId !== targetClubId) {
      throw new Error("You can only submit attendance for your own events.");
    }
    if (event.isClosed) {
      throw new Error("This event is already finalized and locked.");
    }
    if (event.verificationStatus === "APPROVED") {
      throw new Error("This event's points are already approved and credited.");
    }
  } else {
    const created = await prisma.event.create({
      data: {
        title: input.eventTitle?.trim() || "External Attendance",
        description:
          "Attendance submitted by the club for admin verification (external platform).",
        location: "External",
        startDate: now,
        startTime: now,
        capacity: attendees.length,
        totalSeats: attendees.length,
        status: "COMPLETED",
        registrationOpen: false,
        clubId: targetClubId,
        externalRegUrl: input.externalRegUrl || null,
      },
      select: { id: true },
    });
    eventId = created.id;
  }

  // ── Store the audit copy + attendee rows, flag for verification ──────────
  await prisma.$transaction(async (tx) => {
    await tx.externalAttendee.deleteMany({ where: { eventId: eventId! } });
    await tx.externalAttendee.createMany({
      data: attendees.map((a) => ({
        eventId: eventId!,
        email: a.email,
        name: a.name,
        position: a.position,
      })),
    });
    await tx.event.update({
      where: { id: eventId },
      data: {
        verificationStatus: "PENDING_ADMIN_VERIFICATION",
        ...(input.externalRegUrl ? { externalRegUrl: input.externalRegUrl } : {}),
      },
    });
  });

  revalidatePath("/club/dashboard/points");
  revalidatePath("/admin/submissions");

  return { success: true, eventId, attendeeCount: attendees.length };
}
