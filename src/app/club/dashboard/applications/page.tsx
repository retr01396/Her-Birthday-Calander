import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import MembershipApplications from "@/components/MembershipApplications";
import type { ClubJoiningField } from "@/components/ClubJoiningFlow";
import { Navbar } from "@/components/Navbar";

export const dynamic = "force-dynamic";

export default async function ClubApplicationsPage() {
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
      membershipRequiresApproval: true,
      customFormFields: true,
    },
  });

  if (!club) {
    redirect("/club/login");
  }

  const applications = await prisma.clubMember.findMany({
    where: { clubId: club.id },
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

  return (
    <div className="min-h-screen bg-canvas text-on-surface font-body-md">
      <Navbar
        userRole={user.role as any}
        userName={user.name}
        userEmail={user.email}
      />
      <main className="max-w-5xl mx-auto px-4 md:px-6 pt-28 pb-20">
        <MembershipApplications
          clubId={club.id}
          clubName={club.name}
          clubSlug={club.slug}
          requiresApproval={club.membershipRequiresApproval}
          formFields={
            Array.isArray(club.customFormFields)
              ? (club.customFormFields as unknown as ClubJoiningField[])
              : []
          }
          applications={applications as any}
        />
      </main>
    </div>
  );
}
