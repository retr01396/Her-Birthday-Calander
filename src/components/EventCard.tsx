"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  Calendar,
  MapPin,
  Users,
  Building2,
  Ticket,
  ArrowRight,
} from "lucide-react";
import { DigitalPassModal } from "./pass/DigitalPassModal";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface EventCardEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  startTime: string | Date;
  capacity: number;
  imageUrl: string | null;
  passType: string;
  requiresApproval?: boolean;
  club: { id: string; name: string; slug: string | null };
  _count: { registrations: number };
}

export interface EventCardRegistration {
  id: string;
  qrToken: string;
  status: string;
}

interface EventCardProps {
  event: EventCardEvent;
  registration?: EventCardRegistration | null;
  saved: boolean;
  studentName?: string;
  onToggleSave: (eventId: string) => Promise<void> | void;
}

// ─── EventCard Component ─────────────────────────────────────────────────────

export default function EventCard({
  event,
  registration,
  saved,
  studentName,
  onToggleSave,
}: EventCardProps) {
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);

  const registeredCount = event._count.registrations;
  const isFull = registeredCount >= event.capacity;
  const isSoon =
    new Date(event.startTime).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

  // Shortlist events: the registration row exists as a PENDING application,
  // not a live pass, until the club approves it.
  const isPending = registration?.status === "PENDING";
  const isRejected = registration?.status === "REJECTED";
  const hasLivePass =
    !!registration &&
    (registration.status === "REGISTERED" ||
      registration.status === "ATTENDED");

  const handleToggleSave = async () => {
    setSaving(true);
    try {
      await onToggleSave(event.id);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#004fd9]/20 transition-all group flex flex-col overflow-hidden">
        {/* Event Banner / Gradient Top */}
        <div className="relative h-36 bg-gradient-to-br from-[#004fd9]/10 via-violet-100 to-blue-50 overflow-hidden">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#004fd9]/5 via-violet-50 to-blue-50" />
          )}
          <div className="absolute top-3 right-3 flex gap-1.5">
            {isSoon && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                SOON
              </span>
            )}
            {isFull && (
              <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full border border-red-200">
                FULL
              </span>
            )}
          </div>

          {/* Bookmark toggle */}
          <button
            onClick={handleToggleSave}
            disabled={saving}
            aria-label={saved ? "Remove bookmark" : "Bookmark event"}
            className={`absolute top-3 left-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all border ${
              saved
                ? "bg-[#004fd9] text-white border-[#004fd9]"
                : "bg-white/90 text-slate-500 border-slate-200 hover:text-[#004fd9]"
            }`}
          >
            <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
          </button>

          <div className="absolute bottom-3 left-4">
            <span className="text-[10px] font-bold text-slate-600 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm">
              {event.passType}
            </span>
          </div>
        </div>

        {/* Event Info */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-center gap-1.5 mb-2">
            <Building2 className="w-3.5 h-3.5 text-violet-500" />
            <span className="text-xs font-medium text-violet-600">
              {event.club.name}
            </span>
          </div>

          <h3 className="font-bold text-base text-slate-900 group-hover:text-[#004fd9] transition-colors leading-snug">
            {event.title}
          </h3>

          {event.description && (
            <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          )}

          <div className="flex-1" />

          <div className="mt-4 space-y-2 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>
                {new Date(event.startTime).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>

          <div className="mt-3">
            {event.requiresApproval ? (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Applications
                </span>
                <span className="font-semibold text-slate-600">
                  {registeredCount}
                </span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Capacity
                  </span>
                  <span
                    className={`font-semibold ${
                      isFull
                        ? "text-red-600"
                        : registeredCount > event.capacity * 0.8
                        ? "text-amber-600"
                        : "text-slate-600"
                    }`}
                  >
                    {registeredCount}/{event.capacity}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isFull
                        ? "bg-red-500"
                        : registeredCount > event.capacity * 0.8
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        (registeredCount / event.capacity) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-5 pb-5">
          {hasLivePass ? (
            <button
              onClick={() => setShowPass(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#004fd9] hover:bg-[#004fd9]/90 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Ticket className="w-3.5 h-3.5" />
              My Pass
              <ArrowRight className="w-3 h-3" />
            </button>
          ) : isPending ? (
            <span className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold rounded-lg">
              Under Review
            </span>
          ) : isRejected ? (
            <span className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 text-slate-500 text-xs font-semibold rounded-lg">
              Not Selected
            </span>
          ) : (
            <Link
              href={`/events/${event.id}`}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 hover:bg-[#004fd9]/10 text-slate-700 hover:text-[#004fd9] text-xs font-semibold rounded-lg transition-colors"
            >
              {event.requiresApproval ? "Apply Now" : "Register Now"}
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>

      {hasLivePass && (
        <DigitalPassModal
          isOpen={showPass}
          onClose={() => setShowPass(false)}
          registration={{ id: registration.id, qrToken: registration.qrToken }}
          event={{
            title: event.title,
            startDate: new Date(event.startTime),
            location: event.location,
          }}
          studentName={studentName}
        />
      )}
    </>
  );
}
