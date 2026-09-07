import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import PointsClient from "./PointsClient";

export const dynamic = "force-dynamic";

export default async function ClubPointsPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "CLUB" && user.role !== "SUPER_ADMIN")) {
    redirect("/");
  }

  let clubId = user.clubId;
  if (user.role === "SUPER_ADMIN" && !clubId) {
    const firstClub = await prisma.club.findFirst();
    if (firstClub) clubId = firstClub.id;
  }

  if (!clubId) {
    redirect("/");
  }

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: {
      id: true,
      name: true,
      points: true,
      events: {
        select: {
          id: true,
          title: true,
          startDate: true,
          status: true,
          verificationStatus: true,
          externalRegUrl: true,
          _count: { select: { externalAttendees: true } },
          externalAttendees: {
            where: { isMatched: true },
            select: { id: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!club) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <PointsClient
        club={{
          id: club.id,
          name: club.name,
          points: club.points,
          events: club.events.map((evt) => ({
            id: evt.id,
            title: evt.title,
            startDate: evt.startDate,
            status: evt.status,
            verificationStatus: evt.verificationStatus,
            externalRegUrl: evt.externalRegUrl,
            attendeeCount: evt._count.externalAttendees,
            matchedCount: evt.externalAttendees.length,
          })),
        }}
      />
    </div>
  );
}
