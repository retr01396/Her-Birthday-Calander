"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function completeOnboardingStep1(input: {
  name: string;
  year: string;
  department: string;
  division: string;
}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: input.name,
      yearOfStudy: input.year,
      department: input.department,
      division: input.division,
    },
  });

  return { success: true };
}

export async function completeOnboardingStep2(input: {
  professionalBodyClubId: string;
  generalClubIds: [string, string];
  /** Dynamic application-form answers collected per club during onboarding. */
  applications?: Record<string, Record<string, any>>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  if (input.generalClubIds.length !== 2) {
    throw new Error("You must select exactly two general clubs.");
  }

  if (!input.professionalBodyClubId) {
    throw new Error("You must select exactly one professional body club.");
  }

  await prisma.$transaction(async (tx) => {
    // A student may already be enrolled in one of the selected organizations
    // (e.g. they registered through the old flow, which also picked clubs).
    // Skip those instead of crashing on the unique (userId, clubId) key.
    const existingMemberships = await tx.clubMember.findMany({
      where: { userId: user.id },
      select: { clubId: true },
    });
    const existingClubIds = new Set(existingMemberships.map((m) => m.clubId));

    // 1. Create professional body membership
    if (!existingClubIds.has(input.professionalBodyClubId)) {
      const proAnswers = input.applications?.[input.professionalBodyClubId];
      await tx.clubMember.create({
        data: {
          userId: user.id,
          clubId: input.professionalBodyClubId,
          clubRole: "MEMBER",
          // Persist the dynamic-form answers from the joining flow, if any.
          ...(proAnswers
            ? { applicationAnswers: proAnswers, status: "PENDING" }
            : {}),
        },
      });
    }

    // 2. Create general club memberships
    for (const clubId of input.generalClubIds) {
      if (existingClubIds.has(clubId)) continue;
      const answers = input.applications?.[clubId];
      await tx.clubMember.create({
        data: {
          userId: user.id,
          clubId: clubId,
          clubRole: "MEMBER",
          // Persist the dynamic-form answers from the joining flow, if any.
          ...(answers ? { applicationAnswers: answers, status: "PENDING" } : {}),
        },
      });
    }

    // 3. Complete onboarding
    await tx.user.update({
      where: { id: user.id },
      data: { onboardingCompleted: true },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
  revalidatePath("/clubs");
  
  return { success: true };
}
