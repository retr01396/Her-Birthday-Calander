"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";

// ─── Action 1: Club Membership Application (Dynamic Form + WhatsApp) ────────

/**
 * Submit a club membership application. Creates/updates a ClubMember record
 * with the student's form answers. When the club requires review the record
 * stays PENDING until the club approves it; otherwise membership is instant.
 * Returns the club's WhatsApp group link so the UI can show the join overlay.
 *
 * Revalidates: /clubs, /clubs/[slug], /club/dashboard, /club/dashboard/applications
 */
export async function applyToClub(
  clubId: string,
  formAnswers: Record<string, string> = {}
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error("Unauthorized: Please sign in to apply for clubs.");
  }

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: {
      id: true,
      name: true,
      slug: true,
      recruitmentStatus: true,
      whatsappGroupUrl: true,
      membershipRequiresApproval: true,
    },
  });

  if (!club) {
    throw new Error("Club not found.");
  }

  if (
    club.recruitmentStatus !== "OPEN_FOR_MEMBERS" &&
    currentUser.role !== "SUPER_ADMIN"
  ) {
    throw new Error("This club is not accepting new members right now.");
  }

  // When the club requires review, the application stays PENDING until the
  // club approves it. Otherwise joining is instant (membership is real now).
  const requiresApproval = club.membershipRequiresApproval;
  const status = requiresApproval ? "PENDING" : "APPROVED";

  await prisma.clubMember.upsert({
    where: {
      userId_clubId: { userId: currentUser.id, clubId },
    },
    update: {
      applicationAnswers: formAnswers,
      status,
    },
    create: {
      userId: currentUser.id,
      clubId,
      clubRole: "MEMBER",
      roleTitle: "Member",
      isExecutive: false,
      applicationAnswers: formAnswers,
      status,
    },
  });

  revalidatePath("/clubs");
  if (club.slug) revalidatePath(`/clubs/${club.slug}`);
  revalidatePath("/club/dashboard");
  revalidatePath("/club/dashboard/applications");

  return {
    success: true,
    clubName: club.name,
    whatsappGroupUrl: club.whatsappGroupUrl,
    requiresApproval,
  };
}

// ─── Action 2: Club Account Updates Membership Form + WhatsApp Link ─────────

/**
 * Set the club's WhatsApp group link, the review-before-accept toggle, and the
 * custom questions students must answer when applying to join. The club's own
 * account or a SUPER_ADMIN may manage this.
 *
 * Revalidates: /clubs, /clubs/[slug], /club/dashboard, /club/dashboard/applications
 */
export async function updateClubMembershipForm(
  clubId: string,
  data: {
    whatsappGroupUrl?: string | null;
    membershipRequiresApproval?: boolean;
    customFormFields?: Array<{
      id: string;
      label: string;
      type: "text" | "textarea" | "url" | "select" | "radio" | "checkbox" | "image";
      placeholder?: string;
      helpText?: string;
      options?: string[];
      isRequired: boolean;
    }> | null;
  }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error("Unauthorized: You must be logged in.");
  }

  if (currentUser.role !== "SUPER_ADMIN") {
    // The club account may only manage its own club's membership form.
    const isClubOwner =
      currentUser.role === "CLUB" && currentUser.clubId === clubId;
    if (!isClubOwner) {
      throw new Error(
        "Unauthorized: Only the club account or an admin can manage the membership form."
      );
    }
  }

  const club = await prisma.club.update({
    where: { id: clubId },
    data: {
      whatsappGroupUrl: data.whatsappGroupUrl?.trim() || null,
      membershipRequiresApproval: data.membershipRequiresApproval,
      customFormFields:
        data.customFormFields && data.customFormFields.length > 0
          ? (data.customFormFields as any)
          : null,
    },
  });

  revalidatePath("/clubs");
  if (club.slug) revalidatePath(`/clubs/${club.slug}`);
  revalidatePath("/club/dashboard");
  revalidatePath("/club/dashboard/applications");

  return { success: true };
}

// ─── Action 3: Join / Leave Club ────────────────────────────────────────────

/**
 * Toggle the current user's membership in a club:
 *  - Not a member yet  → creates an APPROVED ClubMember (instant join). Blocked
 *    when recruitment is closed or when the club requires application review.
 *  - Already a member  → deletes the ClubMember record.
 *
 * Revalidates: /clubs, /clubs/[slug]
 */
export async function toggleClubMembership(clubId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error("Unauthorized: Please sign in to join clubs.");
  }

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: {
      id: true,
      slug: true,
      recruitmentStatus: true,
      membershipRequiresApproval: true,
    },
  });

  if (!club) {
    throw new Error("Club not found.");
  }

  const existingMember = await prisma.clubMember.findUnique({
    where: {
      userId_clubId: { userId: currentUser.id, clubId },
    },
  });

  if (existingMember) {
    // ── Leave Club ──
    await prisma.clubMember.delete({ where: { id: existingMember.id } });
  } else {
    // ── Join Club ──
    if (
      club.recruitmentStatus !== "OPEN_FOR_MEMBERS" &&
      currentUser.role !== "SUPER_ADMIN"
    ) {
      throw new Error("This club is not accepting new members right now.");
    }
    if (club.membershipRequiresApproval) {
      throw new Error(
        "This club reviews applications before accepting members — apply from the club page instead."
      );
    }
    // Instant-join path (no application form): membership is real immediately.
    await prisma.clubMember.create({
      data: {
        userId: currentUser.id,
        clubId,
        clubRole: "MEMBER",
        roleTitle: "Member",
        isExecutive: false,
        status: "APPROVED",
      },
    });
  }

  revalidatePath("/clubs");
  if (club.slug) revalidatePath(`/clubs/${club.slug}`);

  return { success: true };
}

/**
 * Get the set of club IDs the current user is a member of.
 * Used by server components to pre-render join/leave button state.
 */
export async function getMyMembershipClubIds(): Promise<Set<string>> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return new Set();

  const memberships = await prisma.clubMember.findMany({
    where: { userId: currentUser.id, status: "APPROVED" },
    select: { clubId: true },
  });

  return new Set(memberships.map((m) => m.clubId));
}

/**
 * Get the set of club IDs where the current user has an application that is
 * still awaiting the club's approval. Used to show "Application under review"
 * instead of "Join Club" on public club pages.
 */
export async function getMyPendingMembershipClubIds(): Promise<Set<string>> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return new Set();

  const memberships = await prisma.clubMember.findMany({
    where: { userId: currentUser.id, status: "PENDING" },
    select: { clubId: true },
  });

  return new Set(memberships.map((m) => m.clubId));
}
