import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import AdminSubmissionsClient from "./AdminSubmissionsClient";

export const dynamic = "force-dynamic";

const POSITION_BONUS: Record<string, number> = {
  PARTICIPANT: 0,
  "1ST": 50,
  "2ND": 30,
  "3RD": 20,
};

export default async function AdminSubmissionsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const events = await prisma.event.findMany({
    where: { verificationStatus: { not: "NOT_REQUIRED" } },
    include: {
      club: { select: { id: true, name: true, slug: true, logoUrl: true, points: true } },
      externalAttendees: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  // One query for every uploaded email so "would match" previews are cheap.
  const allEmails = Array.from(
    new Set(
      events.flatMap((e) => e.externalAttendees.map((a) => a.email.trim().toLowerCase()))
    )
  );
  const existingUsers = await prisma.user.findMany({
    where: { email: { in: allEmails } },
    select: { email: true },
  });
  const existingEmails = new Set(existingUsers.map((u) => u.email));

  const data = events.map((event) => {
    const attendees = event.externalAttendees.map((a) => {
      const email = a.email.trim().toLowerCase();
      const points = (event.pointsPerAttender || 10) + (POSITION_BONUS[a.position] ?? 0);
      return {
        id: a.id,
        email,
        name: a.name,
        position: a.position,
        points,
        isMatched: a.isMatched,
        wouldMatch: existingEmails.has(email),
      };
    });

    const wouldMatchCount = attendees.filter((a) => a.wouldMatch).length;
    const creditedCount = attendees.filter((a) => a.isMatched).length;

    return {
      id: event.id,
      title: event.title,
      startDate: event.startDate.toISOString(),
      verificationStatus: event.verificationStatus,
      externalRegUrl: event.externalRegUrl,
      submittedCount: attendees.length,
      wouldMatchCount,
      creditedCount,
      // Points that WOULD be credited if approved (preview for PENDING, actual for APPROVED)
      studentPointsPreview: attendees
        .filter((a) => a.wouldMatch)
        .reduce((sum, a) => sum + a.points, 0),
      // Points actually credited so far
      creditedStudentPoints: attendees
        .filter((a) => a.isMatched)
        .reduce((sum, a) => sum + a.points, 0),
      clubBonusPreview: 50 + wouldMatchCount * 2,
      creditedClubBonus: 50 + creditedCount * 2,
      unmatched: attendees.filter((a) => !a.wouldMatch).map((a) => a.email),
      attendees,
      club: event.club,
    };
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <AdminSubmissionsClient events={data} />
    </div>
  );
}
