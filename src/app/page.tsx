import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { HomePageClient } from "@/components/clubboard/home-page-client";
import { getMyUpcomingEvents, getSavedEventIds } from "@/app/actions/unifiedActions";
import { getPresentationClubs, getPresentationEvents, getPresentationProfessionalBodies } from "@/lib/presentation-fixtures";

export default async function Home() {
  const databaseClubs = await prisma.club.findMany();
  const clubs = databaseClubs.length ? databaseClubs : getPresentationClubs();
  const professionalBodies = getPresentationProfessionalBodies();
  const databaseEvents = await prisma.event.findMany({
    where: {
      startDate: {
        gte: new Date(),
      },
    },
    orderBy: {
      startDate: "asc",
    },
    include: {
      club: true
    }
  });
  const events = databaseEvents.length ? databaseEvents : getPresentationEvents(clubs);

  const myEvents = await getMyUpcomingEvents();
  const savedIds = await getSavedEventIds();
  const registeredEventIds = myEvents.map((e: any) => e.id);

  return (
    <Suspense fallback={null}>
      <HomePageClient 
        clubs={clubs} 
        professionalBodies={professionalBodies}
        events={events} 
        registeredEventIds={registeredEventIds}
        savedEventIds={savedIds}
      />
    </Suspense>
  );
}
