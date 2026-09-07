"use client";

import {
  Ticket,
  Calendar,
  MapPin,
  Plus,
  Clock,
  Building2,
  Sparkles,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface EventItem {
  id: string;
  title: string;
  description: string;
  location: string;
  startTime: string;
  capacity: number;
  imageUrl: string | null;
  passType: string;
  club: { id: string; name: string; slug: string | null };
  _count: { registrations: number };
}

interface UpcomingEventsProps {
  events: EventItem[];
}

// ─── UpcomingEvents Component ────────────────────────────────────────────────

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
  const upcomingEvents = events.filter(
    (e) => new Date(e.startTime) >= new Date()
  );

  return (
    <div className="animate-in">
      {/* Header */}
      <header className="mb-10 text-center">
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">
          My Itinerary
        </h1>
        <p className="text-muted font-body-lg">
          All upcoming events across every club.
        </p>
      </header>

      {/* Upcoming Events */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles size={22} className="text-primary" />
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Upcoming Events
          </h2>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <Calendar size={48} className="mx-auto text-muted mb-3" />
            <h3 className="font-headline-sm text-on-surface mb-1">
              No upcoming events
            </h3>
            <p className="text-muted text-body-md">
              Events created by clubs will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all group overflow-hidden"
              >
                {/* Card Header */}
                <div className="h-28 bg-gradient-to-br from-primary/10 via-violet-50 to-blue-50 relative overflow-hidden">
                  {event.imageUrl && (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold text-primary bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm uppercase tracking-wider">
                      {event.passType}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-4 flex items-center gap-1.5">
                    <Building2 size={12} className="text-violet-600" />
                    <span className="text-xs font-medium text-violet-600 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded">
                      {event.club.name}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-muted text-body-md mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {new Date(event.startTime).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      {event.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Ticket size={14} />
                      {event._count.registrations}/{event.capacity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recently Created Events */}
      {events.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Clock size={20} className="text-secondary" />
            <h2 className="font-headline-md text-headline-md text-on-surface">
              All Events
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.slice(0, 6).map((event) => (
              <div
                key={event.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all flex flex-col h-full"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-on-surface truncate">
                      {event.title}
                    </h3>
                    <p className="text-[11px] text-muted truncate">
                      {event.club.name}
                    </p>
                  </div>
                </div>
                <p className="text-[12px] text-muted line-clamp-2 flex-1">
                  {event.description}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(event.startTime).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Ticket size={12} />
                    {event._count.registrations}/{event.capacity}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Add More Card */}
          <div className="mt-4 bg-slate-100/50 border border-slate-200 border-dashed rounded-xl flex items-center justify-center p-8 group cursor-pointer hover:bg-slate-100 transition-colors">
            <div className="text-center">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-200 text-muted group-hover:text-primary transition-colors">
                <Plus size={22} />
              </div>
              <p className="font-bold text-sm text-muted">
                More events loading...
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
