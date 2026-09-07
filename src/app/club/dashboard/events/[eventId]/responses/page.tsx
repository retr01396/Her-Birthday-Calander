import { getCurrentUser } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import { getEventWithResponses } from "@/app/actions/eventFormActions";
import ResponsesDashboard from "@/components/ResponsesDashboard";
import ApplicationsReview from "@/components/ApplicationsReview";
import { FormFieldSchema } from "@/types/formBuilder";

export default async function ClubEventResponsesPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const user = await getCurrentUser();

  if (!user || (user.role !== "CLUB" && user.role !== "SUPER_ADMIN")) {
    redirect("/");
  }

  let event;
  try {
    event = await getEventWithResponses(eventId);
  } catch (err) {
    notFound();
  }

  const formSchema = (event.formSchema as unknown as FormFieldSchema[]) || [];

  // Shortlist events: this page becomes the application review screen where
  // the club approves/rejects applicants.
  if (event.requiresApproval) {
    return (
      <ApplicationsReview
        eventId={event.id}
        eventTitle={event.title}
        eventCapacity={event.capacity}
        clubName={event.club.name}
        formSchema={formSchema}
        registrations={event.registrations as any}
        backUrl="/club/dashboard"
      />
    );
  }

  return (
    <ResponsesDashboard
      eventId={event.id}
      eventTitle={event.title}
      eventCapacity={event.capacity}
      clubName={event.club.name}
      formSchema={formSchema}
      registrations={event.registrations as any}
      teams={event.teams as any}
      isTeamEvent={event.isTeamEvent}
      backUrl="/club/dashboard"
      isClosed={event.isClosed}
    />
  );
}
