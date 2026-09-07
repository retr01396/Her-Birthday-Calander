"use client";

import { useState } from "react";
import { Trophy, AlertTriangle, Loader2, X, CheckCircle2 } from "lucide-react";

interface FinalizeEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  attendees: { id: string; name: string; email: string }[];
  /** Team events select winning TEAMS instead of individual attendees. */
  isTeamEvent?: boolean;
  teams?: { id: string; name: string; memberCount: number }[];
  pointsConfig: {
    participation: number;
    first: number;
    second: number;
    third: number;
  };
  onSuccess: () => void;
}

type Place = "first" | "second" | "third";

const PLACE_META: Record<
  Place,
  {
    label: string;
    emoji: string;
    cls: string;
    points: (c: FinalizeEventModalProps["pointsConfig"]) => number;
  }
> = {
  first: {
    label: "1st Place Winner",
    emoji: "🥇",
    cls: "text-amber-600",
    points: (c) => c.first,
  },
  second: {
    label: "2nd Place Winner",
    emoji: "🥈",
    cls: "text-slate-500",
    points: (c) => c.second,
  },
  third: {
    label: "3rd Place Winner",
    emoji: "🥉",
    cls: "text-amber-700",
    points: (c) => c.third,
  },
};

export function FinalizeEventModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  attendees,
  isTeamEvent = false,
  teams = [],
  pointsConfig,
  onSuccess,
}: FinalizeEventModalProps) {
  const [winners, setWinners] = useState<Record<Place, string>>({
    first: "",
    second: "",
    third: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!isOpen) return null;

  const setWinner = (place: Place, value: string) => {
    setError("");
    setWinners((prev) => ({ ...prev, [place]: value }));
  };

  // A team/student can only occupy one podium spot.
  const chosenElsewhere = (place: Place) =>
    (Object.keys(winners) as Place[])
      .filter((p) => p !== place)
      .map((p) => winners[p])
      .filter(Boolean);

  const handleFinalize = async () => {
    setError("");
    setLoading(true);
    try {
      const endpoint = isTeamEvent
        ? "/api/club/events/finalize-team"
        : "/api/club/events/finalize";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isTeamEvent
            ? {
                eventId,
                firstPlaceTeamId: winners.first || null,
                secondPlaceTeamId: winners.second || null,
                thirdPlaceTeamId: winners.third || null,
              }
            : {
                eventId,
                firstPlaceUserId: winners.first || null,
                secondPlaceUserId: winners.second || null,
                thirdPlaceUserId: winners.third || null,
              }
        ),
      });

      const data = await res.json();
      if (res.ok) {
        setDone(true);
        onSuccess();
      } else {
        setError(data.error || "Failed to finalize event.");
      }
    } catch {
      setError("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !loading && onClose()}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-40"
        >
          <X size={18} />
        </button>

        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
          <Trophy size={24} />
        </div>

        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Trophy size={18} className="text-amber-500" />
          Finalize Event &amp; Award Points
        </h3>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Closing <strong className="text-slate-700">{eventTitle}</strong> will
          lock the attendance scanner permanently and credit real points to{" "}
          {isTeamEvent ? (
            <>
              every verified member of every team ({pointsConfig.participation}{" "}
              participation points each, plus any winner bonus).
            </>
          ) : (
            <>
              all <strong>{attendees.length}</strong> verified attendee
              {attendees.length === 1 ? "" : "s"} ({pointsConfig.participation}{" "}
              participation points each, plus any winner bonus).
            </>
          )}
        </p>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 p-2.5 rounded-lg mt-4 font-semibold">
            {error}
          </p>
        )}

        {done && (
          <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg mt-4 font-semibold flex items-center gap-1.5">
            <CheckCircle2 size={16} />
            Event finalized — points and leaderboards updated!
          </p>
        )}

        <div className="space-y-4 py-2 mt-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {isTeamEvent ? "Winning Teams" : "Competition Winners"} (Optional)
          </p>

          {(Object.keys(PLACE_META) as Place[]).map((place) => {
            const meta = PLACE_META[place];
            return (
              <div key={place} className="space-y-1">
                <label
                  className={`text-xs font-semibold flex items-center gap-1 ${meta.cls}`}
                >
                  {meta.emoji} {meta.label}
                  <span className="text-slate-400 font-medium">
                    (+{meta.points(pointsConfig)} pts bonus)
                  </span>
                </label>
                <select
                  value={winners[place]}
                  onChange={(e) => setWinner(place, e.target.value)}
                  disabled={loading}
                  className="w-full py-2.5 px-3 bg-[#f8fafc] border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="">-- No Winner --</option>
                  {isTeamEvent
                    ? teams
                        .filter((t) => !chosenElsewhere(place).includes(t.id))
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.memberCount} member
                            {t.memberCount === 1 ? "" : "s"})
                          </option>
                        ))
                    : attendees
                        .filter((a) => !chosenElsewhere(place).includes(a.id))
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({a.email})
                          </option>
                        ))}
                </select>
              </div>
            );
          })}

          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg flex items-start gap-2 text-xs text-amber-700">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Warning: Finalizing permanently closes attendance scanning for
              this event. This cannot be undone.
            </span>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 border-2 border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleFinalize}
            disabled={loading || done}
            className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Trophy size={15} />
            )}
            {loading ? "Finalizing..." : "Finalize & Update Points"}
          </button>
        </div>
      </div>
    </div>
  );
}
