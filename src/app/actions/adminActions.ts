"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";

type SystemRole = "STUDENT" | "SUPER_ADMIN";

/**
 * Promote a user to a different role. Only SUPER_ADMIN can do this.
 */
export async function updateUserRole(userId: string, newRole: SystemRole) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Only super admins can update roles.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export async function suspendClub(clubId: string, suspend: boolean) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Only super admins can suspend clubs.");
  }

  await prisma.club.update({
    where: { id: clubId },
    data: { suspended: suspend },
  });

  revalidatePath("/clubs");
  revalidatePath(`/clubs/${clubId}`);
  revalidatePath("/admin/clubs");
}

export async function getSystemConfig(key: string) {
  const config = await prisma.systemConfig.findUnique({ where: { key } });
  return config?.value || null;
}

export async function setSystemConfig(key: string, value: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.systemConfig.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  revalidatePath("/leaderboard");
  revalidatePath("/admin/config");
}

export async function createClub(data: {
  name: string;
  slug: string;
  username: string;
  passwordHash: string;
  description: string;
  category: "PROFESSIONAL_BODY" | "GENERAL";
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Only super admins can create clubs.");
  }

  const club = await prisma.club.create({
    data: {
      name: data.name,
      slug: data.slug,
      username: data.username,
      passwordHash: data.passwordHash,
      description: data.description,
      category: data.category,
    },
  });

  revalidatePath("/admin/clubs");
  revalidatePath("/clubs");
  return club;
}

export async function updateClubBasic(clubId: string, data: { name: string; description: string; category: "PROFESSIONAL_BODY" | "GENERAL" }) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Only super admins can update clubs.");
  }

  await prisma.club.update({
    where: { id: clubId },
    data: {
      name: data.name,
      description: data.description,
      category: data.category,
    },
  });

  revalidatePath("/admin/clubs");
  revalidatePath("/clubs");
}

/**
 * Get all users for the admin users page (basic list without membership details).
 */
export async function getAllUsers() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      yearOfStudy: true,
      createdAt: true,
    },
  });
}

/**
 * Get all clubs for the admin clubs page.
 */
export async function getAllClubs() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  return prisma.club.findMany({
    include: {
      _count: { select: { events: true, members: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}


