import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { ClubDashboardClient } from "./ClubDashboardClient";
import { Navbar } from "@/components/Navbar";

export default async function ClubDashboardPage() {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    redirect("/");
  }

  let clubId = sessionUser.clubId;

  if (sessionUser.role === "SUPER_ADMIN" && !clubId) {
    const firstClub = await prisma.club.findFirst();
    if (!firstClub) {
      redirect("/admin/clubs/create");
    }
    clubId = firstClub.id;
  }

  if (!clubId || (sessionUser.role !== "CLUB" && sessionUser.role !== "SUPER_ADMIN")) {
    redirect("/");
  }

  const club = await prisma.club.findUnique({
    where: { id: clubId },
  });

  if (!club) {
    redirect("/");
  }

  // Unpublished clubs are locked out of the dashboard until they finish
  // onboarding — they are redirected to the setup wizard instead.
  if (sessionUser.role === "CLUB" && club.status !== "PUBLISHED") {
    redirect("/club/setup");
  }

  // Only confirmed members appear in the roster tab — pending applications
  // are reviewed from the dedicated Applications page.
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
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  const pendingApplications = await prisma.clubMember.count({
    where: { clubId: club.id, status: "PENDING" },
  });

  const events = await prisma.event.findMany({
    where: { clubId: club.id },
    orderBy: { startDate: "desc" },
    include: {
      registrations: {
        where: { status: "ATTENDED" },
        select: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      teams: {
        select: {
          id: true,
          name: true,
          _count: { select: { members: true } },
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-canvas text-on-surface font-body-md">
      <Navbar
        userRole={sessionUser.role as any}
        userName={sessionUser.name}
        userEmail={sessionUser.email}
      />
      <main className="max-w-container-max mx-auto px-4 md:px-margin-page pt-28 pb-20">
        <ClubDashboardClient
          club={club}
          members={members}
          events={events}
          pendingApplications={pendingApplications}
        />
      </main>
    </div>
  );
}
