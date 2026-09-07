import { Navbar } from "@/components/Navbar";
import { getCurrentUser } from "@/lib/session";
import { getMyMembershipClubIds } from "@/app/actions/clubActions";
import ClubIndex from "@/components/clubs/ClubIndex";
import { prisma } from "@/lib/prisma";
import { getPresentationClubs } from "@/lib/presentation-fixtures";
import { getPresentationProfessionalBodies } from "@/lib/presentation-fixtures";

export default async function PublicClubsPage() {
  const user = await getCurrentUser();
  const [databaseClubs, joinedIds] = await Promise.all([
    prisma.club.findMany({
      where: { status: "PUBLISHED", suspended: false },
      include: {
        members: { where: { status: "APPROVED" }, include: { user: true } },
        _count: { select: { members: { where: { status: "APPROVED" } } } },
      },
      orderBy: { members: { _count: "desc" } },
    }),
    getMyMembershipClubIds(),
  ]);
  const clubs = databaseClubs.length ? databaseClubs : getPresentationClubs();
  const professionalBodies = getPresentationProfessionalBodies();

  return (
    <div className="min-h-screen campus-paper">
      <Navbar userRole={user ? (user.role as any) : null} userName={user?.name ?? undefined} />
      <ClubIndex
        clubs={clubs.map((club) => ({
          id: club.id,
          name: club.name,
          tagline: club.tagline,
          description: club.description,
          logoUrl: club.logoUrl,
          slug: club.slug ?? club.id,
          category: club.category,
          memberCount: club._count.members,
          leaderName: club.members[0]?.user?.name ?? null,
          recruitmentOpen: club.recruitmentStatus === "OPEN_FOR_MEMBERS",
          requiresApproval: club.membershipRequiresApproval,
        }))}
        joinedIds={Array.from(joinedIds)}
        professionalBodies={professionalBodies}
      />
    </div>
  );
}
