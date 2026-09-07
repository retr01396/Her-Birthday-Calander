import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import RosterClient from "./RosterClient";
import { Navbar } from "@/components/Navbar";

export default async function ClubRosterPage() {
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
    select: { id: true, name: true, slug: true, rosterSettings: true },
  });

  if (!club) {
    redirect("/club/login");
  }

  // Roster Studio manages confirmed members only — pending applications are
  // reviewed from the Applications page before they reach the roster.
  const members = await prisma.clubMember.findMany({
    where: { clubId: club.id, status: "APPROVED" },
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
    orderBy: [{ displayOrder: "asc" }, { joinedAt: "asc" }],
  });

  return (
    <div className="min-h-screen bg-canvas text-on-surface font-body-md">
      <Navbar
        userRole={user.role as any}
        userName={user.name}
        userEmail={user.email}
      />
      <main className="max-w-container-max mx-auto px-4 md:px-margin-page pt-28 pb-20">
        <RosterClient
          club={club}
          initialMembers={members as any}
          initialSettings={(club.rosterSettings as any) ?? null}
        />
      </main>
    </div>
  );
}
