import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { notFound } from "next/navigation";
import EventPageClient from "./EventPageClient";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }> | { eventId: string };
}) {
  const resolvedParams = await params;
  const eventId = resolvedParams.eventId;

  const user = await getCurrentUser();

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      club: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
        },
      },
      _count: {
        select: { registrations: true },
      },
    },
  });

  if (!event) {
    notFound();
  }

  // Shortlist events count seats by APPROVED applicants only (PENDING
  // applications don't consume capacity). The raw row count is the number of
  // applications received, shown to students as "applied".
  const selectedCount = event.requiresApproval
    ? await prisma.registration.count({
        where: {
          eventId,
          status: { in: ["REGISTERED", "ATTENDED"] },
        },
      })
    : event._count.registrations;
  const applicationCount = event.requiresApproval
    ? event._count.registrations
    : null;

  let registration = null;
  let userTeam = null;

  if (user && user.id) {
    registration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          eventId,
          userId: user.id,
        },
      },
    });

    // A user's team is resolved through their TeamMember row (registrations
    // and teams are linked via TeamMember, not a direct relation).
    const team = await prisma.team.findFirst({
      where: { eventId, members: { some: { userId: user.id } } },
      include: {
        leader: { select: { id: true, name: true } },
        members: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    if (team) {
      userTeam = {
        id: team.id,
        teamName: team.name,
        inviteCode: team.joinCode,
        leader: team.leader,
        members: team.members,
      };
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-on-surface font-body-md">
      <EventPageClient
        event={{
          id: event.id,
          title: event.title,
          description: event.description,
          imageUrl: event.imageUrl,
          location: event.location,
          startDate: event.startDate,
          endDate: event.endTime ?? event.startTime,
          eventType: event.regType,
          externalFormUrl: event.externalRegUrl,
          teamType: event.isTeamEvent ? "TEAM" : "INDIVIDUAL",
          minTeamSize: 1,
          maxTeamSize: event.maxTeamSize,
          club: {
            ...event.club,
            slug: event.club.slug ?? "",
          },
          registrationCount: selectedCount,
          applicationCount,
          capacity: event.capacity,
          registrationOpen: event.registrationOpen,
          showCapacityLimit: event.showCapacityLimit,
          requiresApproval: event.requiresApproval,
          isClosed: event.isClosed,
          hasForm: event.formSchema !== null && Array.isArray(event.formSchema) && event.formSchema.length > 0,
        }}
        user={user}
        initialRegistration={registration}
        initialTeam={userTeam}
      />
    </div>
  );
}
