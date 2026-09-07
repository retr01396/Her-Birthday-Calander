import { getCurrentUser } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ClubEventScannerClient from "./ScannerClient";

export default async function ClubEventScannerPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const user = await getCurrentUser();

  if (!user || (user.role !== "CLUB" && user.role !== "SUPER_ADMIN")) {
    redirect("/");
  }

  // Verify the club account owns this event's club (or is SUPER_ADMIN)
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, clubId: true, isClosed: true, title: true },
  });

  if (!event) {
    notFound();
  }

  if (user.role !== "SUPER_ADMIN" && user.clubId !== event.clubId) {
    redirect("/club/dashboard");
  }

  return (
    <ClubEventScannerClient
      eventId={event.id}
      isClosed={event.isClosed}
      eventTitle={event.title}
    />
  );
}
