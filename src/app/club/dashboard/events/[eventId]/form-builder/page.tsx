import { getCurrentUser } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FormBuilderStudio from "@/components/FormBuilderStudio";
import { FormFieldSchema } from "@/types/formBuilder";

export default async function ClubEventFormBuilderPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const user = await getCurrentUser();

  if (!user || (user.role !== "CLUB" && user.role !== "SUPER_ADMIN")) {
    redirect("/");
  }

  // Fetch Event
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      title: true,
      clubId: true,
      formSchema: true,
    },
  });

  if (!event) {
    notFound();
  }

  // Verify the club account owns this event's club (or is SUPER_ADMIN)
  if (user.role !== "SUPER_ADMIN" && user.clubId !== event.clubId) {
    redirect("/club/dashboard");
  }

  const initialSchema = (event.formSchema as unknown as FormFieldSchema[]) || [];

  return (
    <FormBuilderStudio
      eventId={event.id}
      eventTitle={event.title}
      initialSchema={initialSchema}
      backUrl="/club/dashboard"
    />
  );
}
