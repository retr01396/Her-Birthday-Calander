import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getMyPendingMembershipClubIds } from "@/app/actions/clubActions";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import ClubProfileHeader, {
  type ClubHeaderData,
} from "@/components/clubs/ClubProfileHeader";
import {
  Calendar,
  MapPin,
  Ticket,
  Lock,
  CheckCircle2,
  Users,
  Clock,
} from "lucide-react";
import { getPresentationClubBySlug } from "@/lib/presentation-fixtures";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Timeline badge: UPCOMING / LIVE NOW / ENDED (based on current time).
 */
function getTimelineStatus(event: {
  startTime: Date | string;
  endTime: Date | string | null;
}) {
  const now = new Date();
  const start = new Date(event.startTime);
  const end = event.endTime
    ? new Date(event.endTime)
    : new Date(start.getTime() + 1000 * 60 * 60 * 2);

  if (now < start) {
    return { label: "UPCOMING", classes: "bg-sky-500/10 text-sky-600 border border-sky-500/20" };
  }
  if (now >= start && now <= end) {
    return { label: "LIVE NOW", classes: "bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse" };
  }
  return { label: "ENDED", classes: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20" };
}

/**
 * Primary state badge: FINALIZED (points engine closed) / PENDING VERIFICATION
 * (external event awaiting admin approval) / APPLICATIONS OPEN / CLOSED.
 */
function getEventState(event: {
  isClosed: boolean;
  registrationOpen: boolean;
  verificationStatus: string;
}) {
  if (event.isClosed) {
    return {
      label: "FINALIZED",
      classes: "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20",
      Icon: Lock,
    };
  }
  if (event.verificationStatus === "PENDING_ADMIN_VERIFICATION") {
    return {
      label: "PENDING VERIFICATION",
      classes: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
      Icon: Clock,
    };
  }
  if (event.registrationOpen) {
    return {
      label: "APPLICATIONS OPEN",
      classes: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
      Icon: Ticket,
    };
  }
  return {
    label: "APPLICATIONS CLOSED",
    classes: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20",
    Icon: Ticket,
  };
}

export default async function ClubEventsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();

  const databaseClub = await prisma.club.findUnique({
    where: { slug },
    include: {
      members: { where: { status: "APPROVED" }, select: { userId: true } },
      _count: {
        select: { members: { where: { status: "APPROVED" } }, events: true },
      },
    },
  });

  const club = databaseClub ?? getPresentationClubBySlug(slug);
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

  // Every published event hosted by this club, straight from the database.
  const events: any[] = databaseClub
    ? await prisma.event.findMany({
        where: { clubId: club.id, status: "PUBLISHED" },
        include: { _count: { select: { registrations: true } } },
      })
    : (club as any).events;

  // Open events first (soonest start first), finalized events last (most recent first).
  const sorted = [...events].sort((a, b) => {
    const aClosed = a.isClosed ? 1 : 0;
    const bClosed = b.isClosed ? 1 : 0;
    if (aClosed !== bClosed) return aClosed - bClosed;
    const aTime = new Date(a.startTime).getTime();
    const bTime = new Date(b.startTime).getTime();
    return a.isClosed ? bTime - aTime : aTime - bTime;
  });

  const finalizedCount = events.filter((e) => e.isClosed).length;
  const openCount = events.filter(
    (e) => !e.isClosed && e.registrationOpen
  ).length;

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
        upcomingCount={events.filter((e) => !e.isClosed).length}
        activeTab="events"
      />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 mb-20">
        {/* ── Header ── */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-on-surface tracking-tight">
              Events Hosted by {club.name}
            </h2>
            <p className="text-sm text-muted mt-1">
              {events.length} event{events.length !== 1 ? "s" : ""} ·{" "}
              <span className="text-emerald-600 font-semibold">
                {openCount} open
              </span>{" "}
              · <span className="text-indigo-500 font-semibold">{finalizedCount} finalized</span>
            </p>
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-on-surface mb-2">No Events Yet</h3>
            <p className="text-muted text-sm">
              {club.name} hasn&apos;t hosted any events yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((event) => {
              const isDemo = event.id.startsWith("presentation-event-");
              const state = getEventState(event);
              const timeline = getTimelineStatus(event);
              const isLive = timeline.label === "LIVE NOW";
              const seatsFilled = (event as any)._count?.registrations ?? 0;
              const isFull =
                !event.isClosed && event.registrationOpen && seatsFilled >= event.capacity;

              return (
                <div
                  key={event.id}
                  className={`liquid-glass overflow-hidden transition-all group flex flex-col ${
                    event.isClosed ? "opacity-75" : ""
                  }`}
                >
                  <div
                    className={`h-36 bg-surface-container-highest relative overflow-hidden ${
                      event.isClosed ? "grayscale" : ""
                    }`}
                  >
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary/20 flex items-center justify-center">
                        <Calendar className="w-10 h-10 text-primary/30" />
                      </div>
                    )}
                    {/* State badge (finalized / open / closed) */}
                    <div
                      className={`absolute top-3 left-3 flex items-center gap-1 ${state.classes} font-bold px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wide`}
                    >
                      <state.Icon className="w-3 h-3" />
                      {isDemo ? "PRESENTATION PREVIEW" : state.label}
                    </div>
                    {/* Timeline badge */}
                    <div
                      className={`absolute bottom-3 left-3 ${timeline.classes} font-bold px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wide`}
                    >
                      {timeline.label}
                    </div>
                    {isLive && (
                      <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-rose-500 animate-pulse-dot" />
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h4 className="font-bold text-base text-on-surface mb-1">
                      {event.title}
                    </h4>
                    <p className="text-xs text-muted mb-3 line-clamp-2 flex-1">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-muted mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(event.startTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </span>
                    </div>
                    <div className="mt-1 pt-3 border-t border-border-subtle flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {seatsFilled} / {event.capacity} seats
                      </span>
                      {event.isClosed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Finalized
                        </span>
                      ) : event.verificationStatus === "PENDING_ADMIN_VERIFICATION" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          Awaiting Admin
                        </span>
                      ) : !event.registrationOpen ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-surface-container-low text-muted border border-border-subtle">
                          Applications Closed
                        </span>
                      ) : isFull ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                          Event Full
                        </span>
                      ) : isDemo ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/10 px-3 py-1.5 text-xs font-bold text-muted">
                            Presentation only
                          </span>
                        ) : (
                          <Link
                            href={`/events/${event.id}`}
                            className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-all active:scale-95 ${
                              isLive
                                ? "bg-rose-500 text-white hover:bg-rose-600"
                                : "bg-primary text-white hover:bg-primary-container"
                            }`}
                          >
                            <Ticket className="w-3 h-3" />
                            {isLive ? "Join Now" : "View & Register"}
                          </Link>
                        )}
                    </div>
          </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
