"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { FormFieldSchema, FormResponsesPayload } from "@/types/formBuilder";

/**
 * Save / update the event form schema.
 * Accessible by the event club's account and Super Admins.
 */
export async function saveEventFormSchema(
  eventId: string,
  schema: FormFieldSchema[]
) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: You must be logged in.");
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { club: true },
  });

  if (!event) {
    throw new Error("Event not found.");
  }

  if (user.role !== "SUPER_ADMIN") {
    // Only the club's own account may manage its events.
    const isClubOwner =
      user.role === "CLUB" && user.clubId === event.clubId;

    if (!isClubOwner) {
      throw new Error(
        "Unauthorized: Only the club account or super admin can modify form schema."
      );
    }
  }

  // Update Event form schema
  const updated = await prisma.event.update({
    where: { id: eventId },
    data: {
      formSchema: schema as any,
    },
  });

  revalidatePath(`/club/dashboard/events/${eventId}/form-builder`);
  revalidatePath(`/events/${eventId}/register`);
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/club/dashboard");
  revalidatePath("/");

  return { success: true, event: updated };
}

/**
 * Submit event registration with custom form responses.
 * Accessible by logged-in Students.
 */
export async function submitEventRegistration(
  eventId: string,
  responses: FormResponsesPayload
) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Please sign in to register.");
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      _count: { select: { registrations: true } },
    },
  });

  if (!event) {
    throw new Error("Event not found.");
  }

  // Check event status
  if (event.status === "CANCELLED") {
    throw new Error("Registration closed: This event has been cancelled.");
  }
  if (event.status === "COMPLETED") {
    throw new Error("Registration closed: This event has already concluded.");
  }

  // Check registration window is open
  if (event.registrationOpen === false) {
    throw new Error("Registration closed: The organizer has paused registrations.");
  }

  // Check end time
  if (event.endTime && new Date() > new Date(event.endTime)) {
    throw new Error("Registration closed: Event has already ended.");
  }

  // Capacity only gates DIRECT registration. Shortlist (approval) events
  // accept unlimited applications — seats are enforced when the club
  // approves applicants.
  if (!event.requiresApproval && event._count.registrations >= event.capacity) {
    throw new Error("Registration failed: Event is at full capacity.");
  }

  // Validate required custom fields from schema
  const schema = (event.formSchema as unknown as FormFieldSchema[]) || [];
  for (const field of schema) {
    if (field.isRequired) {
      const val = responses[field.id];
      if (
        val === undefined ||
        val === null ||
        val === "" ||
        (Array.isArray(val) && val.length === 0)
      ) {
        throw new Error(`Please complete the required field: "${field.label}"`);
      }
    }
  }

  // Check for existing registration
  const existing = await prisma.registration.findUnique({
    where: {
      userId_eventId: {
        userId: user.id,
        eventId: eventId,
      },
    },
  });

  if (existing) {
    throw new Error("You are already registered for this event.");
  }

  // Create Registration record. Shortlist events start as PENDING — the
  // pass (status REGISTERED) is granted only after the club approves.
  const registration = await prisma.registration.create({
    data: {
      userId: user.id,
      eventId: eventId,
      formResponses: responses as any,
      status: event.requiresApproval ? "PENDING" : "REGISTERED",
    },
  });

  // Auto-close direct registrations when the last seat is taken. Approval
  // events keep accepting applications regardless of seats filled.
  if (!event.requiresApproval && event.capacity > 0) {
    const registered = await prisma.registration.count({ where: { eventId } });
    if (registered >= event.capacity) {
      await prisma.event.update({
        where: { id: eventId },
        data: { registrationOpen: false },
      });
    }
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/register`);
  revalidatePath(`/club/dashboard/events/${eventId}/responses`);
  revalidatePath("/");
  revalidatePath("/club/dashboard");

  return {
    success: true,
    registrationId: registration.id,
    status: registration.status,
  };
}

/**
 * Fetch event details and all student responses for the club dashboard.
 */
export async function getEventWithResponses(eventId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Please sign in.");
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      club: { select: { id: true, name: true, slug: true } },
      registrations: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
              yearOfStudy: true,
              division: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      teams: {
        include: {
          leader: {
            select: { id: true, name: true, email: true },
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, department: true, yearOfStudy: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { registrations: true } },
    },
  });

  if (!event) {
    throw new Error("Event not found.");
  }

  if (user.role !== "SUPER_ADMIN") {
    // Only the club's own account may manage its events.
    const isClubOwner =
      user.role === "CLUB" && user.clubId === event.clubId;

    if (!isClubOwner) {
      throw new Error("Unauthorized: Access denied.");
    }
  }

  return event;
}

/**
 * Generate CSV string of responses for an event.
 */
export async function getEventResponsesCSV(eventId: string) {
  const event = await getEventWithResponses(eventId);
  const schema = (event.formSchema as unknown as FormFieldSchema[]) || [];

  // Standard columns
  const baseHeaders = ["Student Name", "Email", "Department", "Year", "Registration Date", "Attended"];
  const dynamicHeaders = schema.map((f) => f.label);
  const headers = [...baseHeaders, ...dynamicHeaders];

  const rows = event.registrations.map((reg) => {
    const responses = (reg.formResponses as FormResponsesPayload) || {};
    
    const baseRow = [
      `"${(reg.user.name || "").replace(/"/g, '""')}"`,
      `"${(reg.user.email || "").replace(/"/g, '""')}"`,
      `"${(reg.user.department || "-").replace(/"/g, '""')}"`,
      `"${(reg.user.yearOfStudy || "-").replace(/"/g, '""')}"`,
      `"${new Date(reg.createdAt).toLocaleString()}"`,
      `"${reg.status === "ATTENDED" ? "Yes" : "No"}"`,
    ];

    const dynamicRow = schema.map((field) => {
      const val = responses[field.id];
      if (Array.isArray(val)) {
        return `"${val.join(", ").replace(/"/g, '""')}"`;
      }
      return `"${(val || "").toString().replace(/"/g, '""')}"`;
    });

    return [...baseRow, ...dynamicRow].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  const filename = `${event.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-responses.csv`;

  return { csvContent, filename };
}

// ─── Shortlist (Application Review) Actions ─────────────────────────────────

function revalidateEventPaths(eventId: string) {
  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/register`);
  revalidatePath(`/club/dashboard/events/${eventId}/responses`);
  revalidatePath("/");
  revalidatePath("/club/dashboard");
}

/**
 * Shared authorization for club event-management actions. Throws unless the
 * current user is a SUPER_ADMIN or the club account that owns the event's club.
 */
async function assertLeaderEventAccess(eventId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Please sign in.");
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, clubId: true, capacity: true, isClosed: true },
  });

  if (!event) {
    throw new Error("Event not found.");
  }

  if (user.role !== "SUPER_ADMIN") {
    // Only the club's own account may manage its events.
    const isClubOwner =
      user.role === "CLUB" && user.clubId === event.clubId;

    if (!isClubOwner) {
      throw new Error("Unauthorized: Access denied.");
    }
  }

  return { event };
}

/**
 * Approve a pending application: grants the student a live pass (status
 * REGISTERED). Seats are enforced here — an event's capacity counts
 * approved applications only, so clubs can never over-select.
 */
export async function approveEventRegistration(registrationId: string) {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
  });
  if (!registration) {
    throw new Error("Application not found.");
  }

  const { event } = await assertLeaderEventAccess(registration.eventId);

  if (event.isClosed) {
    throw new Error(
      "This event has been finalized — applications are locked."
    );
  }
  if (registration.status !== "PENDING") {
    throw new Error("This application has already been processed.");
  }

  // Capacity counts approved passes only.
  if (event.capacity > 0) {
    const approved = await prisma.registration.count({
      where: {
        eventId: event.id,
        status: { in: ["REGISTERED", "ATTENDED"] },
      },
    });
    if (approved >= event.capacity) {
      throw new Error(
        "Event is at full capacity — no more students can be selected."
      );
    }
  }

  const updated = await prisma.registration.update({
    where: { id: registrationId },
    data: { status: "REGISTERED" },
  });

  revalidateEventPaths(event.id);
  return { success: true, registration: updated };
}

/**
 * Reject a pending application: the student is not selected and never
 * receives a pass.
 */
export async function rejectEventRegistration(registrationId: string) {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
  });
  if (!registration) {
    throw new Error("Application not found.");
  }

  const { event } = await assertLeaderEventAccess(registration.eventId);

  if (event.isClosed) {
    throw new Error(
      "This event has been finalized — applications are locked."
    );
  }
  if (registration.status !== "PENDING") {
    throw new Error("This application has already been processed.");
  }

  const updated = await prisma.registration.update({
    where: { id: registrationId },
    data: { status: "REJECTED" },
  });

  revalidateEventPaths(event.id);
  return { success: true, registration: updated };
}

/**
 * Approve several pending applications at once. Stops approving once the
 * event's capacity is reached and reports how many were skipped.
 */
export async function bulkApproveEventRegistrations(
  registrationIds: string[]
) {
  const ids = Array.from(new Set(registrationIds));
  if (ids.length === 0) {
    return { approved: 0, skipped: 0 };
  }

  const registrations = await prisma.registration.findMany({
    where: { id: { in: ids }, status: "PENDING" },
  });
  if (registrations.length === 0) {
    throw new Error("No pending applications found to approve.");
  }

  const eventIds = Array.from(new Set(registrations.map((r) => r.eventId)));
  if (eventIds.length !== 1) {
    throw new Error("Applications must belong to the same event.");
  }

  const { event } = await assertLeaderEventAccess(eventIds[0]);

  if (event.isClosed) {
    throw new Error(
      "This event has been finalized — applications are locked."
    );
  }

  let approved = 0;
  for (const reg of registrations) {
    if (event.capacity > 0) {
      const selected = await prisma.registration.count({
        where: {
          eventId: event.id,
          status: { in: ["REGISTERED", "ATTENDED"] },
        },
      });
      if (selected >= event.capacity) break;
    }
    await prisma.registration.update({
      where: { id: reg.id },
      data: { status: "REGISTERED" },
    });
    approved++;
  }

  revalidateEventPaths(event.id);
  return { approved, skipped: registrations.length - approved };
}
