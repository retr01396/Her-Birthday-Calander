import { getCurrentUser } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DynamicFormRenderer from "@/components/DynamicFormRenderer";
import { FormFieldSchema } from "@/types/formBuilder";
import Link from "next/link";
import { AlertCircle, Clock, ArrowLeft } from "lucide-react";

export default async function EventRegistrationPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  // Fetch Event
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      club: { select: { id: true, name: true } },
    },
  });

  if (!event) {
    notFound();
  }

  // Check if student is already registered
  const existingRegistration = await prisma.registration.findUnique({
    where: {
      userId_eventId: {
        userId: user.id,
        eventId: event.id,
      },
    },
  });

  const formSchema = (event.formSchema as unknown as FormFieldSchema[]) || [];

  // Show a closed notice for cancelled / draft / registration-paused events
  if (event.status === "CANCELLED" || event.status === "DRAFT") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-10 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-xl font-black text-slate-900">
            {event.status === "CANCELLED"
              ? "Event Cancelled"
              : "Registrations Closed"}
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            {event.status === "CANCELLED"
              ? `${event.club.name} has cancelled this event. No new registrations are being accepted.`
              : "This event is not accepting registrations right now."}
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Rejected applicants should not see the application form or a misleading
  // "submitted" screen — show a clear notice instead.
  if (existingRegistration?.status === "REJECTED") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-10 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-xl font-black text-slate-900">
            Application Not Selected
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Thank you for applying for {event.title}. Unfortunately, your
            application was not selected for this event.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (event.registrationOpen === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-10 text-center">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-5">
            <Clock size={32} />
          </div>
          <h1 className="text-xl font-black text-slate-900">
            Registrations Paused
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            The organizer has temporarily paused registrations for this event.
            Please check back later.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <DynamicFormRenderer
      eventId={event.id}
      eventTitle={event.title}
      eventDescription={event.description}
      eventLocation={event.location}
      eventStartTime={event.startTime.toISOString()}
      clubName={event.club.name}
      formSchema={formSchema}
      studentUser={{
        id: user.id,
        name: user.name,
        email: user.email,
        department: (user as any).department,
        yearOfStudy: (user as any).yearOfStudy,
      }}
      isAlreadyRegistered={!!existingRegistration}
      requiresApproval={event.requiresApproval}
    />
  );
}
