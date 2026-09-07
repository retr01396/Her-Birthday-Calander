"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";

import { hashPassword } from "@/lib/auth";

export async function createClubByAdmin(data: {
  name: string;
  username: string;
  rawPassword: string;
  tagline: string;
  category: "PROFESSIONAL_BODY" | "GENERAL";
  logoUrl?: string;
  bannerUrl?: string;
  aboutMarkdown?: string;
}) {
  const user = await getCurrentUser();

  // Guard check: SUPER_ADMIN role required
  if (!user?.id || user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Only Super Admins can create clubs.");
  }

  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const passwordHash = hashPassword(data.rawPassword);

  let newClub;
  try {
    newClub = await prisma.club.create({
      data: {
        name: data.name,
        slug,
        username: data.username.toLowerCase().trim(),
        passwordHash,
        category: data.category,
        tagline: data.tagline,
        description: data.tagline || data.name,
        logoUrl: data.logoUrl,
        coverUrl: data.bannerUrl,
        about: data.aboutMarkdown,
        // New clubs start as drafts — the club lead must complete the setup
        // wizard and publish before the club appears publicly.
        status: "UNPUBLISHED",
      },
    });
  } catch (err: any) {
    // Friendly error for unique-constraint collisions (P2002).
    if (err?.code === "P2002") {
      const target = Array.isArray(err?.meta?.target)
        ? err.meta.target.join(", ")
        : typeof err?.meta?.target === "string"
        ? err.meta.target
        : "a unique field";
      throw new Error(
        `That ${target} is already in use. Pick a different club name or username.`
      );
    }
    throw err;
  }

  revalidatePath("/clubs");
  return { success: true, username: newClub.username, slug: newClub.slug };
}
