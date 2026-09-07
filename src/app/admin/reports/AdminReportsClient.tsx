"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Download,
  Users,
  UserX,
  ArrowUpDown,
  BarChart3,
} from "lucide-react";
import { CLASS_OPTIONS } from "@/lib/departments";

// ─── Types ───────────────────────────────────────────────────────────────

type ParticipationStudent = {
  id: string;
  handle: string;
  name: string;
  email: string;
  department: string | null;
  yearOfStudy: string | null;
  classGroup: string;
  attendedEventsCount: number;
  pointsEarned: number;
  bestPlace: "1ST" | "2ND" | "3RD" | null;
  attendedEvents: {
    eventTitle: string;
    clubName: string;
    date: string;
    place: string | null;
    pointsEarned: number;
  }[];
};

type PendingStudent = {
  id: string;
  handle: string;
  name: string;
  email: string;
  department: string | null;
  division: string | null;
  classGroup: string;
  yearOfStudy: string | null;
  createdAt: string;
};

const YEAR_LABELS: Record<string, string> = {
  "1": "1st Year",
  "2": "2nd Year",
  "3": "3rd Year",
  "4": "4th Year",
  "1st Year": "1st Year",
  "2nd Year": "2nd Year",
  "3rd Year": "3rd Year",
  "4th Year": "4th Year",
};

function yearLabel(year: string | null | undefined): string {
  if (!year) return "";
  return YEAR_LABELS[year] ?? year;
}

// ─── CSV Helpers ─────────────────────────────────────────────────────────

/** Quote a value for CSV (handles commas, quotes and newlines). */
function csvCell(value: string | number | null | undefined): string {
  const s = value == null ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

function triggerDownload(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// ─── Main Component ─────────────────────────────────────────────────────

export default function AdminReportsClient() {
  const [activeTab, setActiveTab] = useState<"participation" | "pending">(
    "participation"
  );
  // Format: "<department>::<division>" (division empty when the class has none).
  const [classFilter, setClassFilter] = useState("");
  const [year, setYear] = useState("");
  const [timeline, setTimeline] = useState("3m");
  const [sortBy, setSortBy] = useState("eventsCount");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [participationData, setParticipationData] = useState<
    ParticipationStudent[]
  >([]);
  const [pendingData, setPendingData] = useState<PendingStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Data fetching ──
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const [classDept, classDiv = ""] = classFilter
      ? classFilter.split("::")
      : ["", ""];
    const classQuery = classDept
      ? `&department=${encodeURIComponent(classDept)}${classDiv ? `&division=${encodeURIComponent(classDiv)}` : ""}`
      : "";
    const yearQuery = year ? `&year=${year}` : "";

    const url =
      activeTab === "participation"
        ? `/api/admin/reports/participation?timeline=${timeline}&sortBy=${sortBy}&sortOrder=${sortOrder}${classQuery}${yearQuery}`
        : `/api/admin/reports/pending-onboarding?${classQuery.replace(/^&/, "")}${yearQuery}`;

    fetch(url, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (activeTab === "participation") {
          setParticipationData(data.students ?? []);
        } else {
          setPendingData(data.pendingStudents ?? []);
        }
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("Failed to load report data. Please try again.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [activeTab, classFilter, year, timeline, sortBy, sortOrder]);

  // ── CSV export ──
  const downloadCSV = useCallback(() => {
    if (activeTab === "participation") {
      if (participationData.length === 0) {
        alert("No participation data available to export.");
        return;
      }
      const headers = [
        "Handle",
        "Name",
        "Email",
        "Department",
        "Year",
        "Class",
        "Attended Events Count",
        "Points Earned",
        "Top Result",
      ];
      const rows = participationData.map((s) => [
        s.handle,
        s.name,
        s.email,
        s.department ?? "",
        yearLabel(s.yearOfStudy),
        s.classGroup,
        s.attendedEventsCount,
        s.pointsEarned,
        s.bestPlace ? `${s.bestPlace} PLACE` : "",
      ]);
      triggerDownload(
        [headers, ...rows].map((r) => r.map(csvCell).join(",")).join("\n"),
        "participation_report"
      );
    } else {
      if (pendingData.length === 0) {
        alert("No pending onboarding data available to export.");
        return;
      }
      const headers = [
        "Handle",
        "Name",
        "Email",
        "Department",
        "Year",
        "Account Created Date",
      ];
      const rows = pendingData.map((s) => [
        s.handle || "N/A",
        s.name || "Unassigned",
        s.email,
        s.department ?? "N/A",
        yearLabel(s.yearOfStudy) || "N/A",
        new Date(s.createdAt).toLocaleDateString(),
      ]);
      triggerDownload(
        [headers, ...rows].map((r) => r.map(csvCell).join(",")).join("\n"),
        "pending_onboarding"
      );
    }
  }, [activeTab, participationData, pendingData]);

  const toggleSortOrder = () =>
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));

  const selectCls =
    "w-full py-2.5 px-3 bg-[#f8fafc] border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md appearance-none cursor-pointer";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Admin Reports &amp; Analytics
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <p className="font-label-mono text-label-mono text-muted uppercase tracking-widest">
              {activeTab === "participation"
                ? `${participationData.length.toLocaleString()} Students in Report`
                : `${pendingData.length.toLocaleString()} Onboarding Pending`}
            </p>
          </div>
        </div>
        <button
          onClick={downloadCSV}
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all active:scale-[0.98] shadow-sm"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-sm w-fit">
        <button
          onClick={() => setActiveTab("participation")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === "participation"
              ? "bg-primary text-white shadow-sm"
              : "text-secondary hover:bg-slate-50"
          }`}
        >
          <Users size={16} />
          Participation Analytics
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === "pending"
              ? "bg-primary text-white shadow-sm"
              : "text-secondary hover:bg-slate-50"
          }`}
        >
          <UserX size={16} />
          Pending Onboarding
        </button>
      </div>

      {/* Filter & Control Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          {/* Class (department + division) */}
          <div className="w-full lg:w-64">
            <label className="block font-label-caps text-label-caps text-secondary mb-2 uppercase">
              Class
            </label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className={selectCls}
            >
              <option value="">All Classes</option>
              {CLASS_OPTIONS.map((cls) => (
                <option
                  key={cls.label}
                  value={`${cls.department}::${cls.division ?? ""}`}
                >
                  {cls.label}
                </option>
              ))}
            </select>
          </div>

          {/* Class year */}
          <div className="w-full lg:w-40">
            <label className="block font-label-caps text-label-caps text-secondary mb-2 uppercase">
              Class Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className={selectCls}
            >
              <option value="">All Years</option>
              {["1", "2", "3", "4"].map((y) => (
                <option key={y} value={y}>
                  {yearLabel(y)}
                </option>
              ))}
            </select>
          </div>

          {/* Timeline (participation only) */}
          {activeTab === "participation" && (
            <div className="w-full lg:w-44">
              <label className="block font-label-caps text-label-caps text-secondary mb-2 uppercase">
                Timeline
              </label>
              <select
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className={selectCls}
              >
                <option value="1m">Last Month</option>
                <option value="3m">Last 3 Months</option>
                <option value="6m">Last 6 Months</option>
                <option value="all">All Time</option>
              </select>
            </div>
          )}

          {/* Sort (participation only) */}
          {activeTab === "participation" && (
            <>
              <div className="w-full lg:w-44">
                <label className="block font-label-caps text-label-caps text-secondary mb-2 uppercase">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={selectCls}
                >
                  <option value="eventsCount">Events Participated</option>
                  <option value="name">Name</option>
                  <option value="handle">Handle</option>
                </select>
              </div>
              <button
                onClick={toggleSortOrder}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs border border-slate-200 bg-[#f8fafc] hover:bg-white transition-all whitespace-nowrap"
              >
                <ArrowUpDown size={14} className="text-outline" />
                {sortOrder === "desc" ? "Highest First" : "Lowest First"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      {/* ── Tab 1: Participation ── */}
      {activeTab === "participation" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-slate-100">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Event Attendance Metrics
            </h2>
            <p className="text-sm text-muted mt-1">
              Verified event check-ins per student within the selected timeframe.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 font-label-caps text-label-caps text-secondary uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 font-label-caps text-label-caps text-secondary uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-4 font-label-caps text-label-caps text-secondary uppercase tracking-wider">
                    Top Result
                  </th>
                  <th className="px-6 py-4 font-label-caps text-label-caps text-secondary uppercase tracking-wider text-right">
                    Attended Events
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-16 text-center text-muted font-body-md text-body-md"
                    >
                      Loading data...
                    </td>
                  </tr>
                ) : participationData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <BarChart3
                        size={40}
                        className="mx-auto text-slate-300 mb-4"
                      />
                      <p className="text-secondary font-body-md text-body-md">
                        No participation records found for this filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  participationData.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-headline-sm text-headline-sm text-on-surface">
                          {student.name}
                        </p>
                        <p className="font-label-mono text-label-mono text-muted">
                          {student.handle || student.email}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-fixed text-on-primary-fixed w-fit">
                            {student.classGroup || "Class not set"}
                          </span>
                          <span className="font-body-md text-body-md text-secondary">
                            {student.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {student.bestPlace ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            {student.bestPlace === "1ST"
                              ? "🥇 1st Place"
                              : student.bestPlace === "2ND"
                              ? "🥈 2nd Place"
                              : "🥉 3rd Place"}
                          </span>
                        ) : (
                          <span className="text-muted text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              student.attendedEventsCount > 0
                                ? "bg-primary text-white"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {student.attendedEventsCount} Event
                            {student.attendedEventsCount === 1 ? "" : "s"}
                          </span>
                          {student.pointsEarned > 0 && (
                            <span className="text-[11px] font-bold text-emerald-600">
                              +{student.pointsEarned} pts
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab 2: Pending Onboarding ── */}
      {activeTab === "pending" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-slate-100">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Incomplete Student Registrations
            </h2>
            <p className="text-sm text-muted mt-1">
              Accounts that have not finished the mandatory onboarding process.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 font-label-caps text-label-caps text-secondary uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 font-label-caps text-label-caps text-secondary uppercase tracking-wider">
                    Assigned Class
                  </th>
                  <th className="px-6 py-4 font-label-caps text-label-caps text-secondary uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-4 font-label-caps text-label-caps text-secondary uppercase tracking-wider text-right">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-16 text-center text-muted font-body-md text-body-md"
                    >
                      Loading data...
                    </td>
                  </tr>
                ) : pendingData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <Users size={40} className="mx-auto text-slate-300 mb-4" />
                      <p className="text-secondary font-body-md text-body-md">
                        All student accounts have completed onboarding! 🎉
                      </p>
                    </td>
                  </tr>
                ) : (
                  pendingData.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-headline-sm text-headline-sm text-on-surface">
                          {student.name || "Unassigned"}
                        </p>
                        <p className="font-label-mono text-label-mono text-muted">
                          {student.handle || "no handle"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-body-md text-body-md text-secondary">
                            {student.classGroup
                              ? `${student.classGroup}${
                                  student.yearOfStudy
                                    ? ` (${yearLabel(student.yearOfStudy)})`
                                    : ""
                                }`
                              : "Pending"}
                          </span>
                          <span className="font-label-mono text-label-mono text-muted">
                            {student.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Onboarding Pending
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
