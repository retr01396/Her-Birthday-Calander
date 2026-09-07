"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";

// ─── Data Fetching Helpers (for server components) ─────────────────────────

/**
 * Get all clubs with their leader info, member count, and event count.
 * Used by the public Club Directory.
 */
export async function getAllClubsPublic() {
  return prisma.club.findMany({
    where: { status: "PUBLISHED", suspended: false },
    include: {
      _count: { select: { members: true, events: true } },
    },
    orderBy: { name: "asc" },
  });
}

/**
 * Get all upcoming events with their club info.
 * Used by the public Event Dashboard.
 */
export async function getAllUpcomingEvents() {
  return prisma.event.findMany({
    where: {
      startTime: { gte: new Date() },
      status: "PUBLISHED",
      // Only events from published, non-suspended clubs reach the public feed.
      club: { status: "PUBLISHED", suspended: false },
    },
    include: {
      club: { select: { id: true, name: true, slug: true } },
      _count: { select: { registrations: true } },
    },
    orderBy: { startTime: "asc" },
    take: 50,
  });
}

/**
 * Get a single event by ID with club info and pass count.
 */
export async function getEventById(id: string) {
  return prisma.event.findUnique({
    where: { id },
    include: {
      club: { select: { id: true, name: true, slug: true } },
      _count: { select: { registrations: true } },
    },
  });
}

// ─── Bookmark (Saved Event) Actions ────────────────────────────────────────

/**
 * Toggle a bookmark on an event for the current student. Returns the new
 * saved state. Requires a logged-in student.
 */
export async function toggleSaveEvent(eventId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error("You must be logged in to save events.");
  }

  const existing = await prisma.savedEvent.findUnique({
    where: { userId_eventId: { userId: currentUser.id, eventId } },
  });

  if (existing) {
    await prisma.savedEvent.delete({ where: { id: existing.id } });
    return { saved: false };
  }

  await prisma.savedEvent.create({
    data: { userId: currentUser.id, eventId },
  });
  return { saved: true };
}

/**
 * Return the set of event IDs the current student has bookmarked.
 */
export async function getSavedEventIds() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return [];

  const saved = await prisma.savedEvent.findMany({
    where: { userId: currentUser.id },
    select: { eventId: true },
  });
  return saved.map((s) => s.eventId);
}

/**
 * All upcoming (not yet started) events the current student is registered
 * for, with their registration info (id + qrToken) so a pass can be shown.
 */
export async function getMyUpcomingEvents() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return [];

  const registrations = await prisma.registration.findMany({
    where: {
      userId: currentUser.id,
      event: {
        startTime: { gte: new Date() },
        status: "PUBLISHED",
      },
    },
    include: {
      event: {
        include: {
          club: { select: { id: true, name: true, slug: true } },
          _count: { select: { registrations: true } },
        },
      },
    },
    orderBy: { event: { startTime: "asc" } },
  });

  return registrations.map((r) => ({
    ...r.event,
    registration: { id: r.id, qrToken: r.qrToken, status: r.status },
  }));
}

// ─── Shared member include: full roster details for public club pages ──────

const memberInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      department: true,
      yearOfStudy: true,
    },
  },
} as const;

/**
 * Get a single club by its internal ID with full details.
 */
export async function getClubById(id: string) {
  return prisma.club.findUnique({
    where: { id },
    include: {
      members: {
        // Only confirmed members appear publicly — pending applications are
        // excluded until the club approves them.
        where: { status: "APPROVED" },
        include: memberInclude,
        orderBy: [{ clubRole: "asc" }, { joinedAt: "desc" }],
      },
      events: {
        where: { status: "PUBLISHED" },
        orderBy: { startDate: "desc" },
        take: 20,
      },
      _count: {
        select: { members: { where: { status: "APPROVED" } }, events: true },
      },
    },
  });
}

/**
 * Get a single club by slug with full details.
 */
export async function getClubBySlug(slug: string) {
  return prisma.club.findUnique({
    where: { slug },
    include: {
      members: {
        // Only confirmed members appear publicly — pending applications are
        // excluded until the club approves them.
        where: { status: "APPROVED" },
        include: memberInclude,
        orderBy: [{ clubRole: "asc" }, { joinedAt: "desc" }],
      },
      events: {
        where: { status: "PUBLISHED" },
        orderBy: { startDate: "desc" },
        take: 20,
      },
      posts: {
        orderBy: { createdAt: "desc" },
        include: {
          club: { select: { name: true, logoUrl: true } },
          event: { select: { id: true, title: true, startDate: true } },
          likes: { select: { id: true } },
          taggedUsers: {
            include: { user: { select: { name: true, department: true } } }
          }
        }
      },
      _count: {
        select: { members: { where: { status: "APPROVED" } }, events: true },
      },
    },
  });
}
