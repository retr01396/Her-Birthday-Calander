"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Info,
  Trophy,
  Package,
  Building2,
  Users,
  ArrowLeft,
  Ticket,
} from "lucide-react";
import { DigitalPassModal } from "./pass/DigitalPassModal";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RealEventData {
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

interface EventDetailProps {
  eventId?: string;
  onBackToDashboard?: () => void;
}

// ─── EventDetail Component ───────────────────────────────────────────────────

export default function EventDetail({ eventId, onBackToDashboard }: EventDetailProps) {
  const [event, setEvent] = useState<RealEventData | null>(null);
  const [registration, setRegistration] = useState<{ id: string; qrToken: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      if (!eventId) {
        setLoading(false);
        setError(true);
        return;
      }
      try {
        const { getEventById } = await import(
          "@/app/actions/unifiedActions"
        );
        const { getUserRegistrationStatus } = await import(
          "@/app/actions/eventActions"
        );
        const found = await getEventById(eventId);
        if (found) {
          setEvent(found as unknown as RealEventData);
          const regStatus = await getUserRegistrationStatus(eventId);
          if (regStatus) setRegistration(regStatus);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Failed to fetch event:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
      <div className="animate-in text-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted">Loading event...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="animate-in text-center py-20">
        <Ticket size={48} className="mx-auto text-muted mb-4" />
        <h2 className="font-headline-sm text-on-surface mb-2">Event not found</h2>
        <p className="text-muted text-body-md mb-6">
          This event could not be loaded.
        </p>
        <button
          onClick={onBackToDashboard}
          className="text-primary font-bold hover:underline"
        >
          &larr; Back to Dashboard
        </button>
      </div>
    );
  }

  const registeredCount = event._count.registrations;
  const isFull = registeredCount >= event.capacity;

  return (
    <div className="animate-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-6 font-label-mono text-sm">
        <button
          onClick={onBackToDashboard}
          className="text-muted hover:text-primary transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          Dashboard
        </button>
        <span className="text-muted">/</span>
        <span className="text-on-surface font-bold">{event.title}</span>
      </nav>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-on-background h-[300px] flex flex-col justify-end p-8 md:p-12 mb-8 group">
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-700"
            style={{
              backgroundImage: event.imageUrl
                ? `url('${event.imageUrl}')`
                : `url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30">
              {event.passType}
            </span>
            <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30 flex items-center gap-1">
              <Building2 size={12} />
              {event.club.name}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 drop-shadow-2xl">
            {event.title}
          </h1>
          <div className="flex flex-wrap gap-4 items-center text-white/80 text-sm">
            <span className="flex items-center gap-1.5">
              <Calendar size={15} />
              {new Date(event.startTime).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/40" />
            <span className="flex items-center gap-1.5">
              <MapPin size={15} />
              {event.location}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* About */}
          <section className="bg-surface p-8 rounded-2xl border border-border-subtle shadow-sm">
            <h2 className="font-headline-md text-headline-md mb-4 flex items-center gap-2">
              <Info size={22} className="text-primary" />
              About the Event
            </h2>
            <p className="text-body-lg text-on-surface-variant leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </section>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Action Card */}
          <div className="sticky top-24 space-y-6">
            <div className="bg-surface p-8 rounded-2xl border-2 border-primary shadow-xl">
              <div className="mb-6">
                <span className="text-muted block text-[12px] uppercase tracking-tighter mb-1">
                  Capacity
                </span>
                <div className="text-[28px] font-black font-mono text-primary">
                  {registeredCount}/{event.capacity}
                </div>
                {isFull && (
                  <span className="text-red-500 text-xs font-bold mt-1 block">
                    EVENT FULL
                  </span>
                )}
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full ${
                    isFull
                      ? "bg-red-500"
                      : registeredCount > event.capacity * 0.8
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      (registeredCount / Math.max(event.capacity, 1)) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
              {registration ? (
                <button
                  onClick={() => setShowPassModal(true)}
                  className="w-full py-4 rounded-xl font-bold text-sm bg-on-surface text-surface hover:bg-surface-variant hover:text-on-surface-variant shadow-md transition-all active:scale-95 text-center block"
                >
                  Show My Pass
                </button>
              ) : isFull ? (
                <button
                  disabled
                  className="w-full py-4 rounded-xl font-bold text-sm bg-slate-200 text-slate-400 cursor-not-allowed"
                >
                  Event Full
                </button>
              ) : (
                <a
                  href={`/events/${event.id}/register`}
                  className="w-full py-4 rounded-xl font-bold text-sm bg-primary text-white hover:bg-primary-container shadow-md transition-all active:scale-95 text-center block"
                >
                  Register for Event
                </a>
              )}
              <p className="text-[12px] text-center text-on-surface-variant mt-4">
                Hosted by <strong>{event.club.name}</strong>
              </p>
            </div>

            {/* Details */}
            <div className="bg-surface p-6 rounded-2xl border border-border-subtle shadow-sm space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-secondary-container p-2 rounded-lg">
                  <Calendar size={18} className="text-on-secondary-container" />
                </div>
                <div>
                  <span className="text-muted block text-[11px] uppercase tracking-wider font-bold">
                    Date & Time
                  </span>
                  <p className="text-on-surface text-sm font-semibold">
                    {new Date(event.startTime).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-secondary-container p-2 rounded-lg">
                  <MapPin size={18} className="text-on-secondary-container" />
                </div>
                <div>
                  <span className="text-muted block text-[11px] uppercase tracking-wider font-bold">
                    Location
                  </span>
                  <p className="text-on-surface font-semibold text-sm">
                    {event.location}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-secondary-container p-2 rounded-lg">
                  <Users size={18} className="text-on-secondary-container" />
                </div>
                <div>
                  <span className="text-muted block text-[11px] uppercase tracking-wider font-bold">
                    Club
                  </span>
                  <p className="text-on-surface font-semibold text-sm">
                    {event.club.name}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-secondary-container p-2 rounded-lg">
                  <Ticket size={18} className="text-on-secondary-container" />
                </div>
                <div>
                  <span className="text-muted block text-[11px] uppercase tracking-wider font-bold">
                    Pass Type
                  </span>
                  <p className="text-on-surface font-semibold text-sm uppercase">
                    {event.passType}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {registration && (
        <DigitalPassModal
          isOpen={showPassModal}
          onClose={() => setShowPassModal(false)}
          registration={registration}
          event={{
            title: event.title,
            startDate: new Date(event.startTime),
            location: event.location,
          }}
        />
      )}
    </div>
  );
}
