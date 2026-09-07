"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export interface AdminUsersFilters {
  search?: string;
  department?: string;
  yearOfStudy?: string;
}

export type AdminUserResult = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  yearOfStudy: string | null;
  createdAt: Date;
  memberships: {
    clubRole: string;
    club: { name: string };
  }[];
};

/**
 * Fetch users with dynamic filtering and club membership details.
 * Only accessible by SUPER_ADMIN.
 */
export async function getAdminUsersList(
  filters: AdminUsersFilters = {}
): Promise<AdminUserResult[]> {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Only super admins can view the user list.");
  }

  const { search, department, yearOfStudy } = filters;

  const users = await prisma.user.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        department ? { department: { equals: department, mode: "insensitive" } } : {},
        yearOfStudy ? { yearOfStudy: yearOfStudy } : {},
      ],
    },
    include: {
      memberships: {
        include: {
          club: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return users;
}

/**
 * Get distinct departments for the filter dropdown.
 */
export async function getDepartmentsList(): Promise<string[]> {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
    return [];
  }

  const results = await prisma.user.findMany({
    where: { department: { not: null } },
    distinct: ["department"],
    select: { department: true },
  });

  return results
    .map((r) => r.department!)
    .filter((d): d is string => d !== null)
    .sort();
}

/**
 * Get total user count (for the "X Registered Students" display).
 */
export async function getTotalUserCount(): Promise<number> {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
    return 0;
  }

  return prisma.user.count();
}
