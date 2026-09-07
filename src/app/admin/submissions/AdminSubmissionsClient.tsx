"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Building2,
  AlertTriangle,
  Eye,
  X,
} from "lucide-react";
import FeedbackModal from "@/components/FeedbackModal";

interface AttendeeRow {
  id: string;
  email: string;
  name: string | null;
  position: string;
  points: number;
  isMatched: boolean;
  wouldMatch: boolean;
}

interface VerificationEvent {
  id: string;
  title: string;
  startDate: string;
  verificationStatus: string;
  externalRegUrl: string | null;
  submittedCount: number;
  wouldMatchCount: number;
  creditedCount: number;
  studentPointsPreview: number;
  creditedStudentPoints: number;
  clubBonusPreview: number;
  creditedClubBonus: number;
  unmatched: string[];
  attendees: AttendeeRow[];
  club: {
    id: string;
    name: string;
    slug: string | null;
    logoUrl: string | null;
    points: number;
  };
}

interface AdminSubmissionsClientProps {
  events: VerificationEvent[];
}

type FilterKey = "ALL" | "PENDING_ADMIN_VERIFICATION" | "APPROVED" | "REJECTED" | "REVERTED";

const STATUS_META: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  PENDING_ADMIN_VERIFICATION: {
    label: "Pending Verification",
    className: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  APPROVED: {
    label: "Approved & Credited",
    className: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-rose-500/10 border-rose-500/30 text-rose-400",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
  REVERTED: {
    label: "Reverted (Audit)",
    className: "bg-slate-500/10 border-slate-500/30 text-slate-400",
    icon: <RotateCcw className="w-3.5 h-3.5" />,
  },
};

async function callApi(path: string, body: Record<string, unknown>) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Request failed.");
  }
  return data;
}

export default function AdminSubmissionsClient({ events }: AdminSubmissionsClientProps) {
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [inspectEvent, setInspectEvent] = useState<VerificationEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ title: string; message: string } | null>(null);

  const filtered = events.filter((e) => filter === "ALL" || e.verificationStatus === filter);

  const handleApprove = async (event: VerificationEvent) => {
    const confirmed = window.confirm(
      `Approve and credit ${event.studentPointsPreview} pts to ${event.wouldMatchCount} matched students, plus +${event.clubBonusPreview} pts to ${event.club.name}?`
    );
    if (!confirmed) return;
    setActionLoading(event.id);
    setError(null);
    try {
      const data = await callApi("/api/admin/events/verify-external", { eventId: event.id });
      setFeedback({
        title: "Points Approved & Credited!",
        message: `${data.matchedCount} students credited (+${data.studentPointsTotal} pts), club +${data.clubBonus} pts. ${data.unmatchedCount} email(s) didn't match any account.`,
      });
      window.setTimeout(() => window.location.reload(), 900);
    } catch (err: any) {
      setError(err.message || "Approval failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (event: VerificationEvent) => {
    const confirmed = window.confirm(
      `Reject this submission from ${event.club.name}? No points will be credited.`
    );
    if (!confirmed) return;
    setActionLoading(event.id);
    setError(null);
    try {
      await callApi("/api/admin/events/reject-external", { eventId: event.id });
      setFeedback({
        title: "Submission Rejected",
        message: "The submission was rejected. No points were credited.",
      });
      window.setTimeout(() => window.location.reload(), 900);
    } catch (err: any) {
      setError(err.message || "Rejection failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevert = async (event: VerificationEvent) => {
    const reason = window.prompt(
      "Enter the reason for reverting these points (audit trail):",
      "Fraudulent or invalid attendance data"
    );
    if (reason === null) return;
    setActionLoading(event.id);
    setError(null);
    try {
      const data = await callApi("/api/admin/events/revert-points", { eventId: event.id, reason });
      setFeedback({
        title: "Points Reverted",
        message: `${data.revertedCount} ledger entries marked REVERTED. Student and club balances have been restored.`,
      });
      window.setTimeout(() => window.location.reload(), 900);
    } catch (err: any) {
      setError(err.message || "Revert failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const statusBadge = (status: string) => {
    const meta = STATUS_META[status];
    if (!meta) return null;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${meta.className}`}
      >
        {meta.icon}
        {meta.label}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1.5">
            <ShieldAlert className="w-4 h-4" />
            <span>Admin Verification Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            External Event Verifications
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Clubs submit MakeMyPass / offline attendance lists here. Verify the
            email breakdown, approve to credit points, or revert a decision to
            roll points back — everything is logged.
          </p>
        </div>

        <div className="flex flex-wrap bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto gap-1">
          {(
            [
              ["ALL", "All"],
              ["PENDING_ADMIN_VERIFICATION", "Pending"],
              ["APPROVED", "Approved"],
              ["REJECTED", "Rejected"],
              ["REVERTED", "Reverted"],
            ] as [FilterKey, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                filter === key
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Verification Cards */}
      {filtered.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-14 text-center text-slate-500 text-sm">
          No external event submissions match this filter.
        </div>
      )}

      <div className="space-y-6">
        {filtered.map((event) => {
          const isPending = event.verificationStatus === "PENDING_ADMIN_VERIFICATION";
          const isApproved = event.verificationStatus === "APPROVED";
          const credited = event.creditedCount > 0;

          return (
            <div
              key={event.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden"
            >
              {/* Header row */}
              <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-bold text-white">{event.title}</h2>
                      {statusBadge(event.verificationStatus)}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Submitted by <span className="text-slate-200 font-medium">{event.club.name}</span>{" "}
                      · {new Date(event.startDate).toLocaleDateString()}
                      {event.externalRegUrl && (
                        <>
                          {" "}
                          ·{" "}
                          <a
                            href={event.externalRegUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-400 hover:underline"
                          >
                            registration link
                          </a>
                        </>
                      )}
                    </p>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Club points balance:{" "}
                      <span className="text-amber-400 font-semibold">{event.club.points} pts</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setInspectEvent(event)}
                  className="self-start inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Inspect List
                </button>
              </div>

              {/* Transparent breakdown */}
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                    Uploaded Emails
                  </div>
                  <div className="text-2xl font-black text-white mt-1">
                    {event.submittedCount}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    from club CSV
                  </div>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                    Matched Students
                  </div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    {event.wouldMatchCount}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {event.unmatched.length} unmatched
                  </div>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                    Student Points
                  </div>
                  <div className="text-2xl font-black text-indigo-400 mt-1">
                    {credited
                      ? `+${event.creditedStudentPoints}`
                      : isPending
                      ? `+${event.studentPointsPreview}`
                      : "+0"}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {credited
                      ? `${event.creditedCount} credited`
                      : isPending
                      ? "preview if approved"
                      : "not credited"}
                  </div>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                    Club Host Bonus
                  </div>
                  <div className="text-2xl font-black text-amber-400 mt-1">
                    {credited
                      ? `+${event.creditedClubBonus}`
                      : isPending
                      ? `+${event.clubBonusPreview}`
                      : "+0"}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    50 base + 2 per matched
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 flex flex-wrap gap-3">
                {isPending && (
                  <>
                    <button
                      onClick={() => handleApprove(event)}
                      disabled={actionLoading === event.id}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve & Credit Points
                    </button>
                    <button
                      onClick={() => handleReject(event)}
                      disabled={actionLoading === event.id}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-sm font-semibold transition disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </>
                )}
                {isApproved && (
                  <button
                    onClick={() => handleRevert(event)}
                    disabled={actionLoading === event.id}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-600/80 border border-slate-700 hover:border-rose-600/40 text-slate-200 hover:text-white text-sm font-semibold transition disabled:opacity-50"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Revert Event Points
                  </button>
                )}
                {event.verificationStatus === "REJECTED" && (
                  <p className="text-xs text-rose-400/80 self-center">
                    Rejected — no points were credited. The club can fix the list and resubmit.
                  </p>
                )}
                {event.verificationStatus === "REVERTED" && (
                  <p className="text-xs text-slate-400 self-center">
                    Reverted — all credited points were deducted and ledger entries marked
                    REVERTED.
                  </p>
                )}
                {actionLoading === event.id && (
                  <span className="inline-block self-center animate-spin rounded-full h-4 w-4 border-2 border-indigo-400 border-t-transparent" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspect modal */}
      {inspectEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Attendee Audit — {inspectEvent.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {inspectEvent.submittedCount} uploaded ·{" "}
                  <span className="text-emerald-400">
                    {inspectEvent.wouldMatchCount} would match
                  </span>{" "}
                  ·{" "}
                  <span className="text-rose-400">
                    {inspectEvent.unmatched.length} unmatched
                  </span>
                </p>
              </div>
              <button
                onClick={() => setInspectEvent(null)}
                className="text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/60 hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-2.5 rounded-l-lg">#</th>
                    <th className="p-2.5">Email</th>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Position</th>
                    <th className="p-2.5">Points</th>
                    <th className="p-2.5 rounded-r-lg">Match</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {inspectEvent.attendees.map((a, idx) => (
                    <tr key={a.id} className="hover:bg-slate-950/30">
                      <td className="p-2.5 text-slate-500 font-mono">{idx + 1}</td>
                      <td className="p-2.5 font-mono text-indigo-300 font-medium">
                        {a.email}
                      </td>
                      <td className="p-2.5 text-slate-300">{a.name || "—"}</td>
                      <td className="p-2.5">
                        {a.position === "1ST" ? (
                          <span className="text-amber-400 font-semibold">🥇 1st</span>
                        ) : a.position === "2ND" ? (
                          <span className="text-slate-300 font-semibold">🥈 2nd</span>
                        ) : a.position === "3RD" ? (
                          <span className="text-amber-700 font-semibold">🥉 3rd</span>
                        ) : (
                          <span className="text-slate-400">Participant</span>
                        )}
                      </td>
                      <td className="p-2.5 font-mono text-amber-400">+{a.points}</td>
                      <td className="p-2.5">
                        {a.isMatched ? (
                          <span className="text-emerald-400 font-semibold">Credited</span>
                        ) : a.wouldMatch ? (
                          <span className="text-emerald-400/70">Would match</span>
                        ) : (
                          <span className="text-rose-400">Unmatched</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Feedback */}
      <FeedbackModal
        isOpen={!!feedback}
        onClose={() => setFeedback(null)}
        title={feedback?.title || ""}
        message={feedback?.message || ""}
        type="success"
      />
    </div>
  );
}
