"use client";

import React, { useState, useRef } from "react";
import {
  Trophy,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  AlertCircle,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  Link as LinkIcon,
} from "lucide-react";
import { parseCsv } from "@/lib/csv";
import { submitExternalAttendance } from "@/app/actions/pointSubmissionActions";
import FeedbackModal from "@/components/FeedbackModal";

type Position = "PARTICIPANT" | "1ST" | "2ND" | "3RD";

interface ParsedRow {
  email: string;
  name: string;
  position: Position;
}

interface ExternalEventItem {
  id: string;
  title: string;
  startDate: Date;
  status: string;
  verificationStatus: string;
  externalRegUrl: string | null;
  attendeeCount: number;
  matchedCount: number;
}

interface ClubPointsClientProps {
  club: {
    id: string;
    name: string;
    points: number;
    events: ExternalEventItem[];
  };
}

const STATUS_META: Record<
  string,
  { label: string; className: string; icon: React.ReactNode }
> = {
  PENDING_ADMIN_VERIFICATION: {
    label: "Pending Review",
    className:
      "bg-amber-500/10 border border-amber-500/20 text-amber-400",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  APPROVED: {
    label: "Approved & Credited",
    className:
      "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-rose-500/10 border border-rose-500/20 text-rose-400",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
  REVERTED: {
    label: "Points Reverted",
    className: "bg-slate-500/10 border border-slate-500/20 text-slate-400",
    icon: <RotateCcw className="w-3.5 h-3.5" />,
  },
};

function normalizePosition(raw: string): Position {
  const v = raw.trim().toUpperCase();
  if (["1", "FIRST", "1ST", "GOLD", "WINNER"].includes(v)) return "1ST";
  if (["2", "SECOND", "2ND", "SILVER"].includes(v)) return "2ND";
  if (["3", "THIRD", "3RD", "BRONZE"].includes(v)) return "3RD";
  return "PARTICIPANT";
}

function statusBadge(status: string) {
  const meta = STATUS_META[status] ?? {
    label: status.replaceAll("_", " "),
    className: "bg-slate-500/10 border border-slate-500/20 text-slate-400",
    icon: <Info className="w-3.5 h-3.5" />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${meta.className}`}
    >
      {meta.icon}
      {meta.label}
    </span>
  );
}

export default function PointsClient({ club }: ClubPointsClientProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [eventTitle, setEventTitle] = useState<string>("");
  const [externalRegUrl, setExternalRegUrl] = useState<string>("");
  const [csvRawText, setCsvRawText] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [rows, setRows] = useState<ParsedRow[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const submissions = club.events.filter((e) => e.attendeeCount > 0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvRawText(text);

      const parsed: ParsedRow[] = parseCsv(text)
        .map((row) => ({
          email: row.email || row["email address"] || row.mail || "",
          name: row.name || row.fullname || "",
          position: normalizePosition(row.position || row.rank || ""),
        }))
        .filter((r) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email));

      if (parsed.length > 0) {
        setRows(parsed);
      } else {
        setError(
          "No rows with a valid email column were found. Make sure the CSV has an 'email' column (name/position are optional)."
        );
        setRows([]);
      }
    };
    reader.readAsText(file);
  };

  const setRowPosition = (index: number, position: Position) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, position } : r)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rows.length === 0) {
      setError("Please upload a valid CSV file with attendee emails.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await submitExternalAttendance({
        clubId: club.id,
        eventId: selectedEventId || undefined,
        eventTitle: eventTitle || undefined,
        externalRegUrl: externalRegUrl || undefined,
        csvFileUrl: `data:text/csv;base64,${btoa(
          unescape(encodeURIComponent(csvRawText))
        )}`,
        attendees: rows.map((r) => ({
          email: r.email,
          name: r.name || undefined,
          position: r.position,
        })),
      });

      setShowSuccessModal(true);
      setRows([]);
      setCsvRawText("");
      setFileName("");
      setEventTitle("");
      setExternalRegUrl("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setError(err.message || "Failed to submit points request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Trophy className="w-4 h-4" />
            <span>External Event Points Pipeline</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            {club.name} Attendance & Points
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Upload attendance lists from external platforms (MakeMyPass, Google
            Forms, offline sheets). No points are credited until an admin
            verifies the submission.
          </p>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 min-w-[220px]">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Club Points
            </div>
            <div className="text-2xl font-black text-white">
              {club.points.toLocaleString()}{" "}
              <span className="text-xs font-normal text-amber-400">pts</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-indigo-400" />
              <span>Submit External Attendance</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Required column: <code className="text-indigo-300 font-mono">email</code>.
              Optional: <code className="text-indigo-300 font-mono">name</code>,{" "}
              <code className="text-indigo-300 font-mono">position</code> (1ST / 2ND / 3RD).
              Winners can also be set below after parsing.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Event Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Link to an Event (Optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none cursor-pointer"
                >
                  <option value="">
                    General Club Activity (auto-creates a record)
                  </option>
                  {club.events
                    .filter((evt) => evt.verificationStatus !== "APPROVED")
                    .map((evt) => (
                      <option key={evt.id} value={evt.id} className="bg-slate-900 text-white">
                        {evt.title}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {!selectedEventId && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Activity Title (Optional)
                </label>
                <input
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Offline Workshop — Data Structures"
                  className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm placeholder:text-slate-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Registration Link (Optional)
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  value={externalRegUrl}
                  onChange={(e) => setExternalRegUrl(e.target.value)}
                  placeholder="https://makenpass.com/..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* CSV File Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Attendance CSV File *
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-indigo-500/80 bg-slate-950/60 hover:bg-slate-950 p-6 rounded-2xl text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <FileSpreadsheet className="w-8 h-8 text-slate-400 group-hover:text-indigo-400 transition" />
                <div className="text-xs font-medium text-slate-300">
                  {fileName ? (
                    <span className="text-indigo-400 font-semibold">{fileName}</span>
                  ) : (
                    <span>
                      Click or drag to upload{" "}
                      <span className="text-indigo-400">.csv</span> file
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500">
                  Auto-parses emails; winners can be marked per row
                </div>
              </div>
            </div>

            {/* Parsed Rows Preview */}
            {rows.length > 0 && (
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    {rows.length} attendee{rows.length === 1 ? "" : "s"} parsed
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Mark winners below
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/50">
                  {rows.map((row, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-2.5 flex items-center gap-3"
                    >
                      <span className="text-[11px] text-slate-500 font-mono w-6">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-white truncate">
                          {row.email}
                        </div>
                        {row.name && (
                          <div className="text-[11px] text-slate-500 truncate">
                            {row.name}
                          </div>
                        )}
                      </div>
                      <select
                        value={row.position}
                        onChange={(e) =>
                          setRowPosition(idx, e.target.value as Position)
                        }
                        className={`text-[11px] font-semibold px-2 py-1 rounded-lg border appearance-none cursor-pointer focus:outline-none ${
                          row.position === "1ST"
                            ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                            : row.position === "2ND"
                            ? "bg-slate-400/15 border-slate-400/40 text-slate-300"
                            : row.position === "3RD"
                            ? "bg-amber-700/15 border-amber-700/40 text-amber-600"
                            : "bg-slate-900 border-slate-700 text-slate-400"
                        }`}
                      >
                        <option value="PARTICIPANT">Participant</option>
                        <option value="1ST">🥇 1st Place</option>
                        <option value="2ND">🥈 2nd Place</option>
                        <option value="3RD">🥉 3rd Place</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Points Info */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>
                  Verified attendees earn <b className="text-white">+10 pts</b> each;
                  winners get an extra{" "}
                  <b className="text-amber-400">+50 / +30 / +20</b>. The club earns a
                  hosting bonus on approval.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  Points are only credited after an admin approves — not at upload.
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || rows.length === 0}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition duration-150 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Submit for Admin Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Submission History */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>Submission History</span>
            </h2>
            <span className="text-xs text-slate-400">
              {submissions.length} record{submissions.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Event / Activity</th>
                  <th className="p-3.5">Attendees</th>
                  <th className="p-3.5">Matched</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 rounded-r-xl">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-950/40 transition">
                    <td className="p-3.5 font-medium text-white">
                      {sub.title}
                      {sub.externalRegUrl && (
                        <a
                          href={sub.externalRegUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-[11px] text-indigo-400 hover:underline truncate max-w-[220px]"
                        >
                          {sub.externalRegUrl}
                        </a>
                      )}
                    </td>
                    <td className="p-3.5 font-mono">{sub.attendeeCount}</td>
                    <td className="p-3.5 font-mono text-emerald-400">
                      {sub.matchedCount}
                    </td>
                    <td className="p-3.5">
                      {statusBadge(sub.verificationStatus)}
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {new Date(sub.startDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {submissions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 text-xs">
                      No external attendance submissions yet. Upload your first
                      report!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <FeedbackModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Submission Sent for Verification!"
        message="Your attendance list has been submitted to CampusHub Administrators. Points will be credited to students and your club only after approval."
        type="success"
        primaryButtonText="Got it"
      />
    </div>
  );
}
