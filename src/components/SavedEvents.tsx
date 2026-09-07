"use client";

import { useState, useEffect } from "react";
import {
  Bookmark,
  Calendar,
  MapPin,
  Users,
  Trash2,
  Plus,
  Sparkles,
  Building2,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RealEvent {
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

// ─── SavedEvents Component ───────────────────────────────────────────────────

export default function SavedEvents() {
  const [events, setEvents] = useState<RealEvent[]>([]);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch real events from the database
  useEffect(() => {
    async function fetchEvents() {
      try {
        const { getAllUpcomingEvents } = await import(
          "@/app/actions/unifiedActions"
        );
        const data = await getAllUpcomingEvents();
        setEvents(data as unknown as RealEvent[]);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const toggleBookmark = (id: string) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Show only bookmarked events in the main view, or all events if none bookmarked
  const displayEvents =
    bookmarked.size > 0
      ? events.filter((e) => bookmarked.has(e.id))
      : events;

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-on-surface mb-2">
            Saved Events
          </h1>
          <p className="text-muted text-sm">
            Bookmark events to keep track of what you don&apos;t want to miss.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200/80 rounded-xl shadow-sm">
          <span className="text-xs font-bold text-primary">
            {bookmarked.size} EVENT{bookmarked.size !== 1 ? "S" : ""} SAVED
          </span>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted text-sm">Loading events...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && displayEvents.length === 0 && (
        <div className="text-center py-20">
          <Bookmark size={48} className="mx-auto text-muted mb-4" />
          <h3 className="text-lg font-bold text-on-surface mb-1">
            {events.length === 0
              ? "No events available"
              : "No bookmarked events"}
          </h3>
          <p className="text-muted text-sm">
            {events.length === 0
              ? "Events created by clubs will appear here."
              : "Click the bookmark icon on any event to save it here."}
          </p>
        </div>
      )}

      {/* Events Grid */}
      {!loading && displayEvents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayEvents.map((event) => {
            const isSaved = bookmarked.has(event.id);
            const registeredCount = event._count.registrations;
            const dateStr = new Date(event.startTime).toLocaleDateString(
              "en-US",
              {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              }
            );

            return (
              <div
                key={event.id}
                className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
              >
                {/* Image / Banner */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 via-violet-50 to-blue-50">
                  {event.imageUrl ? (
                    <div
                      className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                      style={{ backgroundImage: `url('${event.imageUrl}')` }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 size={40} className="text-primary/20" />
                    </div>
                  )}

                  {/* Pass type badge */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 shadow-sm">
                    <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                      {event.passType}
                    </span>
                  </div>

                  {/* Bookmark toggle */}
                  <button
                    onClick={() => toggleBookmark(event.id)}
                    className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform ${
                      isSaved
                        ? "bg-primary text-white"
                        : "bg-white text-secondary"
                    }`}
                  >
                    <Bookmark
                      size={18}
                      fill={isSaved ? "currentColor" : "none"}
                    />
                  </button>

                  {/* Club name overlay */}
                  <div className="absolute bottom-3 left-4 flex items-center gap-1.5">
                    <Building2 size={12} className="text-violet-600" />
                    <span className="text-xs font-medium text-violet-600 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded">
                      {event.club.name}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="font-bold text-lg text-on-surface mb-2">
                    {event.title}
                  </h3>
                  <p className="text-sm text-muted mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-3 text-sm text-muted">
                      <Calendar size={16} />
                      <span>{dateStr}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted">
                      <MapPin size={16} />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted">
                      <Users size={16} />
                      <span>
                        {registeredCount}/{event.capacity} registered
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => toggleBookmark(event.id)}
                      className={`text-xs font-bold flex items-center gap-1 transition-colors ${
                        isSaved
                          ? "text-error hover:text-error/80"
                          : "text-primary hover:text-primary/80"
                      }`}
                    >
                      {isSaved ? (
                        <>
                          <Trash2 size={12} />
                          Remove
                        </>
                      ) : (
                        <>
                          <Bookmark size={12} />
                          Save Event
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Info Card */}
          <div className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 bg-slate-50/50 hover:bg-slate-100/50 transition-colors cursor-pointer group">
            <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus size={24} className="text-primary" />
            </div>
            <p className="font-bold text-base text-on-surface mb-1 text-center">
              Find more events
            </p>
            <p className="text-sm text-muted text-center max-w-[200px]">
              Browse all upcoming campus events from every club.
            </p>
          </div>
        </div>
      )}

      {/* Recommendation Banner */}
      {events.length > 0 && (
        <div className="mt-16 bg-primary/5 border border-primary/10 rounded-2xl p-8 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={20} className="text-primary" />
              <h2 className="text-xl font-black text-primary">
                All Campus Events
              </h2>
            </div>
            <p className="text-sm text-muted mb-6">
              There {events.length === 1 ? "is" : "are"}{" "}
              <strong>{events.length}</strong> upcoming event
              {events.length !== 1 ? "s" : ""} across all clubs. Bookmark the
              ones you&apos;re interested in to build your personal schedule.
            </p>
          </div>
          <div className="absolute -right-12 -bottom-12 opacity-10">
            <Sparkles size={240} />
          </div>
        </div>
      )}
    </div>
  );
}
