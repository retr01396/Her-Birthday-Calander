"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

/**
 * Resolve the current session and the club id it is allowed to manage.
 * - CLUB sessions may only manage their own club (user.clubId).
 * - SUPER_ADMIN may manage any club (returns null so callers can decide).
 * Throws for everything else.
 */
async function getSessionClubId(): Promise<{
  userId: string;
  role: string;
  clubId: string | null;
}> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");

  if (user.role === "CLUB") {
    if (!user.clubId) throw new Error("Unauthorized: Club account has no club.");
    return { userId: user.id, role: user.role, clubId: user.clubId };
  }

  if (user.role === "SUPER_ADMIN") {
    return { userId: user.id, role: user.role, clubId: null };
  }

  throw new Error("Unauthorized: Club credentials required");
}

/** Resolve the default club a SUPER_ADMIN operates on (first club). */
async function getFirstClubId(): Promise<string | null> {
  const firstClub = await prisma.club.findFirst({ select: { id: true } });
  return firstClub?.id ?? null;
}

// ─── 1. Profile & About Editor ────────────────────────────────────────────────
export async function updateClubProfile(data: {
  clubId?: string;
  tagline?: string;
  logoUrl?: string;
  bannerUrl?: string;
  aboutMarkdown?: string;
  recruitmentStatus?: string;
}) {
  const session = await getSessionClubId();

  let targetClubId = data.clubId ?? null;

  if (session.role === "CLUB") {
    // A club account can ONLY update its own club — never a client-supplied id.
    targetClubId = session.clubId;
  } else if (session.role === "SUPER_ADMIN") {
    targetClubId = targetClubId ?? (await getFirstClubId());
  }

  if (!targetClubId) {
    throw new Error("Club not found.");
  }

  const updatedClub = await prisma.club.update({
    where: { id: targetClubId },
    data: {
      tagline: data.tagline,
      logoUrl: data.logoUrl,
      coverUrl: data.bannerUrl,
      about: data.aboutMarkdown,
      recruitmentStatus: data.recruitmentStatus,
    },
  });

  if (updatedClub.slug) {
    revalidatePath(`/clubs/${updatedClub.slug}`);
  }
  revalidatePath("/club/dashboard");
  return { success: true, club: updatedClub };
}

// ─── 2. Roster & Executive Roles ─────────────────────────────────────────────

/** Revalidate every surface that renders a club's roster. */
function revalidateRoster(clubSlug: string | null) {
  if (clubSlug) revalidatePath(`/clubs/${clubSlug}`);
  revalidatePath("/clubs");
  revalidatePath("/club/dashboard");
  revalidatePath("/club/dashboard/roster");
}

/**
 * Persist the drag-and-drop display order of roster members. Items are a
 * full renumbering (0..n-1) of the club's roster.
 */
export async function updateRosterOrder(
  items: { memberId: string; displayOrder: number }[]
) {
  const session = await getSessionClubId();

  if (items.length === 0) return { success: true };

  // Load every member being reordered and verify ownership in one query.
  const members = await prisma.clubMember.findMany({
    where: { id: { in: items.map((i) => i.memberId) } },
    select: { id: true, clubId: true },
  });
  if (members.length !== items.length) {
    throw new Error("One or more roster members were not found.");
  }

  if (session.role === "CLUB" &&
    members.some((m) => m.clubId !== session.clubId)) {
    throw new Error(
      "Unauthorized: you can only reorder your own club roster."
    );
  }

  await prisma.$transaction(
    items.map((item) =>
      prisma.clubMember.update({
        where: { id: item.memberId },
        data: { displayOrder: item.displayOrder },
      })
    )
  );

  return { success: true };
}

/**
 * Update a roster entry's public display fields (photo, name, class, title,
 * executive flag, badge color). Returns the refreshed member.
 */
export async function updateMemberProfile(data: {
  memberId: string;
  avatarUrl?: string | null;
  displayName?: string | null;
  className?: string | null;
  roleTitle?: string;
  isExecutive?: boolean;
  badgeColor?: string | null;
}) {
  const session = await getSessionClubId();

  const member = await prisma.clubMember.findUnique({
    where: { id: data.memberId },
    select: { clubId: true },
  });
  if (!member) {
    throw new Error("Roster member not found.");
  }
  if (session.role === "CLUB" && member.clubId !== session.clubId) {
    throw new Error(
      "Unauthorized: you can only manage your own club's roster."
    );
  }

  const updated = await prisma.clubMember.update({
    where: { id: data.memberId },
    data: {
      avatarUrl: data.avatarUrl,
      displayName: data.displayName,
      className: data.className,
      roleTitle: data.roleTitle,
      isExecutive: data.isExecutive,
      badgeColor: data.badgeColor,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
          yearOfStudy: true,
        },
      },
      club: { select: { slug: true } },
    },
  });

  revalidateRoster(updated.club.slug);
  return { success: true, member: updated };
}

/**
 * Add an existing student to the club roster (status APPROVED so they show
 * up publicly). Duplicate memberships are rejected.
 */
export async function addRosterMember(clubId: string, userId: string) {
  const session = await getSessionClubId();

  let targetClubId: string | null = clubId;
  if (session.role === "CLUB") {
    targetClubId = session.clubId!;
  } else if (session.role === "SUPER_ADMIN") {
    targetClubId = targetClubId || (await getFirstClubId());
  }
  if (!targetClubId) {
    throw new Error("Club not found.");
  }
  if (session.role === "CLUB" && clubId !== session.clubId) {
    throw new Error(
      "Unauthorized: you can only manage your own club's roster."
    );
  }

  const student = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!student || student.role !== "STUDENT") {
    throw new Error("Student not found.");
  }

  const existing = await prisma.clubMember.findUnique({
    where: { userId_clubId: { userId, clubId: targetClubId } },
  });
  if (existing) {
    throw new Error("This student is already on the roster.");
  }

  const last = await prisma.clubMember.aggregate({
    where: { clubId: targetClubId },
    _max: { displayOrder: true },
  });

  const created = await prisma.clubMember.create({
    data: {
      userId,
      clubId: targetClubId,
      status: "APPROVED",
      roleTitle: "Member",
      displayOrder: (last._max.displayOrder ?? -1) + 1,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
          yearOfStudy: true,
        },
      },
      club: { select: { slug: true } },
    },
  });

  revalidateRoster(created.club.slug);
  return { success: true, member: created };
}

/**
 * Add a free-form roster entry — someone without a student account
 * (e.g. faculty, alumni, guests). Only a name (and optionally a photo,
 * class, role and badge color) is needed; no user link is created.
 */
export async function addFreeformMember(
  clubId: string,
  data: {
    name: string;
    className?: string | null;
    roleTitle?: string | null;
    avatarUrl?: string | null;
    badgeColor?: string | null;
    isExecutive?: boolean;
  }
) {
  const session = await getSessionClubId();

  let targetClubId: string | null = clubId;
  if (session.role === "CLUB") {
    targetClubId = session.clubId!;
  } else if (session.role === "SUPER_ADMIN") {
    targetClubId = targetClubId || (await getFirstClubId());
  }
  if (!targetClubId) {
    throw new Error("Club not found.");
  }
  if (session.role === "CLUB" && clubId !== session.clubId) {
    throw new Error(
      "Unauthorized: you can only manage your own club's roster."
    );
  }

  const name = data.name?.trim();
  if (!name) {
    throw new Error("A name is required.");
  }

  const last = await prisma.clubMember.aggregate({
    where: { clubId: targetClubId },
    _max: { displayOrder: true },
  });

  const created = await prisma.clubMember.create({
    data: {
      clubId: targetClubId,
      status: "APPROVED",
      roleTitle: data.roleTitle?.trim() || "Member",
      isExecutive: data.isExecutive ?? false,
      avatarUrl: data.avatarUrl || null,
      displayName: name,
      className: data.className?.trim() || null,
      badgeColor: data.badgeColor || null,
      displayOrder: (last._max.displayOrder ?? -1) + 1,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
          yearOfStudy: true,
        },
      },
      club: { select: { slug: true } },
    },
  });

  revalidateRoster(created.club.slug);
  return { success: true, member: created };
}

/**
 * Remove a member from the roster. The club leader (clubRole LEADER)
 * cannot be removed — that membership grants club access.
 */
export async function removeRosterMember(memberId: string) {
  const session = await getSessionClubId();

  const member = await prisma.clubMember.findUnique({
    where: { id: memberId },
    select: { clubId: true, clubRole: true, club: { select: { slug: true } } },
  });
  if (!member) {
    throw new Error("Roster member not found.");
  }
  if (session.role === "CLUB" && member.clubId !== session.clubId) {
    throw new Error(
      "Unauthorized: you can only manage your own club's roster."
    );
  }
  await prisma.clubMember.delete({ where: { id: memberId } });

  revalidateRoster(member.club.slug);
  return { success: true };
}

/**
 * Search students who are not already on this club's roster. Used by the
 * "Add Member" picker.
 */
export async function searchStudents(query: string) {
  const session = await getSessionClubId();
  const q = query.trim();
  if (!q) return [];

  let clubId: string | null = session.role === "CLUB" ? session.clubId : null;
  if (session.role === "SUPER_ADMIN") {
    clubId = clubId ?? (await getFirstClubId());
  }

  const existingIds = clubId
    ? (
        await prisma.clubMember.findMany({
          where: { clubId },
          select: { userId: true },
        })
      ).map((m) => m.userId)
    : [];

  const users = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { handle: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      department: true,
      yearOfStudy: true,
    },
    take: 8,
  });

  return users.filter((u) => !existingIds.includes(u.id));
}

/**
 * Save the Roster Studio design settings (layout, frames, typography,
 * colors) for a club.
 */
export async function saveRosterSettings(
  clubId: string,
  settings: Record<string, unknown>
) {
  const session = await getSessionClubId();

  let targetClubId: string | null = clubId;
  if (session.role === "CLUB") {
    targetClubId = session.clubId!;
  } else if (session.role === "SUPER_ADMIN") {
    targetClubId = targetClubId || (await getFirstClubId());
  }
  if (!targetClubId) {
    throw new Error("Club not found.");
  }
  if (session.role === "CLUB" && clubId !== session.clubId) {
    throw new Error(
      "Unauthorized: you can only manage your own club's roster."
    );
  }

  const updated = await prisma.club.update({
    where: { id: targetClubId },
    data: { rosterSettings: settings as any },
    select: { slug: true },
  });

  revalidateRoster(updated.slug);
  return { success: true };
}

// ─── 2b. Membership Applications (joining review) ────────────────────────────

/** Revalidate every surface that renders membership state. */
function revalidateMembership(clubSlug: string | null) {
  if (clubSlug) revalidatePath(`/clubs/${clubSlug}`);
  revalidatePath("/clubs");
  revalidatePath("/club/dashboard");
  revalidatePath("/club/dashboard/applications");
  revalidatePath("/club/dashboard/roster");
}

/**
 * Toggle whether joining this club requires leader review. When enabled,
 * applications stay PENDING until approved; when disabled, new applications
 * are approved instantly. Existing memberships are left untouched.
 */
export async function updateMembershipRequiresApproval(
  clubId: string,
  enabled: boolean
) {
  const session = await getSessionClubId();

  let targetClubId: string | null = clubId;
  if (session.role === "CLUB") {
    targetClubId = session.clubId!;
  } else if (session.role === "SUPER_ADMIN") {
    targetClubId = targetClubId || (await getFirstClubId());
  }
  if (!targetClubId) {
    throw new Error("Club not found.");
  }
  if (session.role === "CLUB" && clubId !== session.clubId) {
    throw new Error(
      "Unauthorized: you can only manage your own club's memberships."
    );
  }

  const updated = await prisma.club.update({
    where: { id: targetClubId },
    data: { membershipRequiresApproval: enabled },
    select: { slug: true },
  });

  revalidateMembership(updated.slug);
  return { success: true };
}

/**
 * Load a single membership and verify the session may manage its club.
 * Returns the membership (with club slug) or null.
 */
async function getManagedMembership(memberId: string) {
  const session = await getSessionClubId();
  const member = await prisma.clubMember.findUnique({
    where: { id: memberId },
    select: {
      clubId: true,
      status: true,
      club: { select: { slug: true } },
    },
  });
  if (!member) return null;
  if (session.role === "CLUB" && member.clubId !== session.clubId) {
    throw new Error(
      "Unauthorized: you can only review your own club's applications."
    );
  }
  return member;
}

/**
 * Approve a student's membership application. The student becomes an
 * official member (status APPROVED) and shows up on the public roster.
 */
export async function approveMembershipApplication(memberId: string) {
  const member = await getManagedMembership(memberId);
  if (!member) throw new Error("Application not found.");
  if (member.status !== "PENDING") {
    throw new Error("Only pending applications can be approved.");
  }

  await prisma.clubMember.update({
    where: { id: memberId },
    data: { status: "APPROVED" },
  });

  revalidateMembership(member.club.slug);
  return { success: true };
}

/**
 * Reject a student's membership application. The student does not become a
 * member and is excluded from the roster.
 */
export async function rejectMembershipApplication(memberId: string) {
  const member = await getManagedMembership(memberId);
  if (!member) throw new Error("Application not found.");
  if (member.status !== "PENDING") {
    throw new Error("Only pending applications can be rejected.");
  }

  await prisma.clubMember.update({
    where: { id: memberId },
    data: { status: "REJECTED" },
  });

  revalidateMembership(member.club.slug);
  return { success: true };
}

/**
 * Approve several pending applications in one shot. Already-processed ids
 * are skipped silently; only PENDING memberships are touched.
 */
export async function bulkApproveMembershipApplications(memberIds: string[]) {
  const session = await getSessionClubId();
  if (memberIds.length === 0) return { success: true, approved: 0 };

  const members = await prisma.clubMember.findMany({
    where: { id: { in: memberIds } },
    select: { id: true, clubId: true, status: true, club: { select: { slug: true } } },
  });
  if (members.length !== memberIds.length) {
    throw new Error("One or more applications were not found.");
  }
  if (
    session.role === "CLUB" &&
    members.some((m) => m.clubId !== session.clubId)
  ) {
    throw new Error(
      "Unauthorized: you can only review your own club's applications."
    );
  }

  const result = await prisma.clubMember.updateMany({
    where: { id: { in: memberIds }, status: "PENDING" },
    data: { status: "APPROVED" },
  });

  const slugs = Array.from(new Set(members.map((m) => m.club.slug).filter(Boolean))) as string[];
  for (const slug of slugs) revalidateMembership(slug);
  revalidateMembership(null);

  return { success: true, approved: result.count };
}

export async function updateMemberRole(data: {
  memberId: string;
  roleTitle: string;
  isExecutive: boolean;
}) {
  const session = await getSessionClubId();

  // Load the membership and verify it belongs to the authorized club.
  const member = await prisma.clubMember.findUnique({
    where: { id: data.memberId },
    select: { clubId: true },
  });

  if (!member) {
    throw new Error("Member not found.");
  }

  if (session.role === "CLUB" && member.clubId !== session.clubId) {
    throw new Error("Unauthorized: You can only manage members of your own club.");
  }

  const updatedMember = await prisma.clubMember.update({
    where: { id: data.memberId },
    data: {
      roleTitle: data.roleTitle,
      isExecutive: data.isExecutive,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
          yearOfStudy: true,
        },
      },
      club: { select: { slug: true } },
    },
  });

  if (updatedMember.club.slug) {
    revalidatePath(`/clubs/${updatedMember.club.slug}`);
  }
  revalidatePath("/club/dashboard");

  return { success: true, member: updatedMember };
}

// ─── 3. Event Management ──────────────────────────────────────────────────────
export async function createOrUpdateClubEvent(data: {
  id?: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  startTime?: string;
  capacity: number;
  showCapacityLimit?: boolean;
  imageUrl?: string;
  passType?: string;
  registrationFee?: number;
  status?: string;
  requiresApproval?: boolean;
  regType?: any;
  externalProvider?: any;
  externalRegUrl?: string;
  isTeamEvent?: boolean;
  minTeamSize?: number;
  maxTeamSize?: number;
  passStrategy?: any;
}) {
  const session = await getSessionClubId();

  let clubId: string;
  if (session.role === "CLUB") {
    clubId = session.clubId!;

    // Unpublished clubs cannot create or edit events until they complete
    // the setup wizard (status must be PUBLISHED).
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: { status: true },
    });
    if (club && club.status !== "PUBLISHED") {
      throw new Error(
        "You must publish your club profile before posting events."
      );
    }
  } else {
    const firstClubId = await getFirstClubId();
    if (!firstClubId) throw new Error("No clubs exist yet. Create one first.");
    clubId = firstClubId;
  }

  // Combine the date and time into a LOCAL datetime. Parsing a date-only
  // string ("2026-08-13") as `new Date(...)` yields UTC midnight, which is
  // already in the past for "today" — silently hiding published events from
  // the main dashboard's `startTime >= now` filter.
  const startDateTime = data.startTime
    ? new Date(`${data.startDate}T${data.startTime}`)
    : new Date(`${data.startDate}T18:00:00`);

  if (isNaN(startDateTime.getTime())) {
    throw new Error("Invalid start date/time.");
  }

  // Defense-in-depth: the student dashboard only lists upcoming events
  // (startTime >= now). Reject past datetimes server-side so an event is
  // never silently created in a state where it can't appear on /dashboard.
  if (!data.id && startDateTime <= new Date()) {
    throw new Error(
      "Event date/time must be in the future so it appears on the student dashboard."
    );
  }

  // Revalidate the club dashboard and all public surfaces that show events.
  const revalidateClub = async (slug: string | null) => {
    revalidatePath("/club/dashboard");
    revalidatePath("/clubs");
    if (slug) revalidatePath(`/clubs/${slug}`);
    revalidatePath("/");
  };

  if (data.id) {
    // Update event — verify the event belongs to the authorized club.
    const existing = await prisma.event.findUnique({
      where: { id: data.id },
      select: { clubId: true },
    });

    if (!existing) {
      throw new Error("Event not found.");
    }

    if (session.role === "CLUB" && existing.clubId !== clubId) {
      throw new Error("Unauthorized: You can only manage your own club's events.");
    }

    const event = await prisma.event.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        startDate: startDateTime,
        startTime: startDateTime,
        capacity: data.capacity,
        totalSeats: data.capacity,
        showCapacityLimit: data.showCapacityLimit ?? true,
        imageUrl: data.imageUrl,
        passType: data.passType || "PASS",
        registrationFee: data.registrationFee ?? 0,
        status: data.status || "PUBLISHED",
        requiresApproval: data.requiresApproval,
        regType: data.regType || "INTERNAL",
        externalProvider: data.externalProvider,
        externalRegUrl: data.externalRegUrl,
        isTeamEvent: data.isTeamEvent ?? false,
        minTeamSize: data.minTeamSize ?? 2,
        maxTeamSize: data.maxTeamSize ?? 4,
        passStrategy: data.passStrategy ?? "CAPTAIN_ONLY",
      },
      include: { club: { select: { slug: true } } },
    });

    await revalidateClub(event.club.slug);
    return { success: true, event };
  } else {
    // Create new event
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: { slug: true },
    });
    const event = await prisma.event.create({
      data: {
        clubId,
        title: data.title,
        description: data.description,
        location: data.location,
        startDate: startDateTime,
        startTime: startDateTime,
        capacity: data.capacity,
        totalSeats: data.capacity,
        showCapacityLimit: data.showCapacityLimit ?? true,
        imageUrl: data.imageUrl,
        passType: data.passType || "PASS",
        registrationFee: data.registrationFee ?? 0,
        status: data.status || "PUBLISHED",
        requiresApproval: data.requiresApproval,
        regType: data.regType || "INTERNAL",
        externalProvider: data.externalProvider,
        externalRegUrl: data.externalRegUrl,
        isTeamEvent: data.isTeamEvent ?? false,
        minTeamSize: data.minTeamSize ?? 2,
        maxTeamSize: data.maxTeamSize ?? 4,
        passStrategy: data.passStrategy ?? "CAPTAIN_ONLY",
      },
    });

    await revalidateClub(club?.slug ?? null);
    return { success: true, event };
  }
}
