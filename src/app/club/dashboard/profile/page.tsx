import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import ClubProfileClient from "./ClubProfileClient";

export default async function ClubProfileSettingsPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "CLUB" && user.role !== "SUPER_ADMIN")) {
    redirect("/club/login");
  }

  let clubId = user.clubId;
  if (user.role === "SUPER_ADMIN" && !clubId) {
    const firstClub = await prisma.club.findFirst();
    if (firstClub) clubId = firstClub.id;
  }

  if (!clubId) {
    redirect("/club/login");
  }

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: {
      id: true,
      name: true,
      slug: true,
      username: true,
      tagline: true,
      logoUrl: true,
      coverUrl: true,
      about: true,
      recruitmentStatus: true,
      whatsappGroupUrl: true,
    },
  });

  if (!club) {
    redirect("/club/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <ClubProfileClient club={club} />
    </div>
  );
}
