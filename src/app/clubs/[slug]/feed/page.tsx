import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getMyPendingMembershipClubIds } from "@/app/actions/clubActions";
import { Navbar } from "@/components/Navbar";
import ClubProfileHeader, {
  type ClubHeaderData,
} from "@/components/clubs/ClubProfileHeader";
import PostCard from "@/components/feed/PostCard";
import { Megaphone } from "lucide-react";

export default async function ClubFeedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();

  const club = await prisma.club.findUnique({
    where: { slug },
    include: {
      members: { where: { status: "APPROVED" }, select: { userId: true } },
      _count: {
        select: { members: { where: { status: "APPROVED" } }, events: true },
      },
    },
  });

  if (!club) {
    notFound();
  }

  // Draft / suspended clubs are not public. Only the club's own account or a
  // site admin may preview them directly.
  const canViewUnpublished =
    user?.role === "SUPER_ADMIN" || (user?.role === "CLUB" && user.clubId === club.id);
  if (club.status !== "PUBLISHED" && !canViewUnpublished) {
    notFound();
  }

  // Every post this club has published — straight from the database.
  const posts = await prisma.clubPost.findMany({
    where: { clubId: club.id },
    orderBy: { createdAt: "desc" },
    include: {
      club: { select: { name: true, logoUrl: true } },
      event: { select: { id: true, title: true, startDate: true } },
      likes: { select: { id: true } },
      taggedUsers: {
        include: { user: { select: { name: true, department: true } } },
      },
    },
  });

  const isMember = user
    ? club.members.some((m) => m.userId === user.id)
    : false;
  const isOpenForMembers = club.recruitmentStatus === "OPEN_FOR_MEMBERS";
  const pendingMembership = user
    ? await getMyPendingMembershipClubIds()
    : new Set<string>();
  const hasPendingApplication = pendingMembership.has(club.id);

  const headerClub: ClubHeaderData = {
    ...club,
    coverUrl: club.coverUrl,
    category: club.category,
    customFormFields: (club.customFormFields as any) ?? null,
    members: club.members.map((m) => ({ userId: m.userId })),
  };

  return (
    <div className="min-h-screen bg-canvas text-on-surface font-body-md">
      <Navbar userRole={user ? (user.role as any) : null} userName={user?.name ?? undefined} />

      <ClubProfileHeader
        club={headerClub}
        isMember={isMember}
        isOpenForMembers={isOpenForMembers}
        hasPendingApplication={hasPendingApplication}
        upcomingCount={club._count.events}
        activeTab="feed"
      />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 mb-20">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-on-surface tracking-tight">
              📢 Feed &amp; Updates
            </h2>
            <p className="text-sm text-muted mt-1">
              {posts.length} post{posts.length !== 1 ? "s" : ""} from {club.name}
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {posts.length === 0 ? (
            <div className="text-center py-16 bg-surface rounded-2xl border border-border-subtle">
              <Megaphone className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-on-surface mb-2">
                No Updates Yet
              </h3>
              <p className="text-muted text-sm">
                {club.name} hasn&apos;t posted any updates yet.
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={user?.id} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
