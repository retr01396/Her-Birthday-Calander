"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ClubJoiningField } from "@/components/ClubJoiningFlow";
import {
  approveMembershipApplication,
  rejectMembershipApplication,
  bulkApproveMembershipApplications,
} from "@/app/actions/clubDashboardActions";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  CheckCheck,
  Loader2,
  Mail,
  GraduationCap,
  Calendar,
  FileText,
  UserCheck,
  ClipboardList,
  Info,
} from "lucide-react";

export interface MembershipApplicationData {
  id: string;
  status: string; // PENDING | APPROVED | REJECTED
  joinedAt: Date | string;
  applicationAnswers: Record<string, unknown> | null;
  user: {
    id: string;
    name: string;
    email: string;
    department?: string | null;
    yearOfStudy?: string | null;
  };
}

interface MembershipApplicationsProps {
  clubId: string;
  clubName: string;
  clubSlug: string | null;
  /** Whether joining currently requires club review. */
  requiresApproval: boolean;
  formFields: ClubJoiningField[];
  applications: MembershipApplicationData[];
}

type Tab = "pending" | "approved" | "rejected";

const DEFAULT_LABELS: Record<string, string> = {
  fullName: "Full Name",
  rollNumber: "Roll Number",
  phone: "Phone Number",
};

const STATUS_PILL: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "Pending Review",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  APPROVED: {
    label: "Approved Member",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-50 text-red-600 border-red-200",
  },
};

export default function MembershipApplications({
  clubId,
  clubName,
  clubSlug,
  requiresApproval,
  formFields = [],
  applications = [],
}: MembershipApplicationsProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [message, setMessage] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  const pending = useMemo(
    () => applications.filter((a) => a.status === "PENDING"),
    [applications]
  );
  const approved = useMemo(
    () => applications.filter((a) => a.status === "APPROVED"),
    [applications]
  );
  const rejected = useMemo(
    () => applications.filter((a) => a.status === "REJECTED"),
    [applications]
  );

  const currentList =
    tab === "pending" ? pending : tab === "approved" ? approved : rejected;

  const filtered = currentList.filter((a) => {
    const q = searchTerm.toLowerCase();
    return (
      a.user.name.toLowerCase().includes(q) ||
      a.user.email.toLowerCase().includes(q) ||
      (a.user.department || "").toLowerCase().includes(q) ||
      (a.user.yearOfStudy || "").toLowerCase().includes(q)
    );
  });

  // Label lookup: default profile fields + the club's custom questions.
  const labelMap = useMemo(() => {
    const map: Record<string, string> = { ...DEFAULT_LABELS };
    for (const f of formFields) {
      if (f && f.id && f.label) map[f.id] = f.label;
    }
    return map;
  }, [formFields]);

  const answerEntries = (a: MembershipApplicationData) => {
    if (!a.applicationAnswers) return [];
    return Object.entries(a.applicationAnswers)
      .filter(
        ([key, value]) =>
          value !== undefined && value !== null && value !== ""
      )
      .map(([key, value]) => ({
        label: labelMap[key] || key,
        value: Array.isArray(value) ? value.join(", ") : String(value),
      }));
  };

  const flash = (kind: "success" | "error", text: string) => {
    setMessage({ kind, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const handleApprove = async (id: string) => {
    setBusyId(id);
    try {
      await approveMembershipApplication(id);
      flash("success", "Application approved — student is now a member.");
      router.refresh();
    } catch (err: any) {
      flash("error", err instanceof Error ? err.message : "Failed to approve.");
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id: string) => {
    setBusyId(id);
    try {
      await rejectMembershipApplication(id);
      flash("success", "Application rejected.");
      router.refresh();
    } catch (err: any) {
      flash("error", err instanceof Error ? err.message : "Failed to reject.");
    } finally {
      setBusyId(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    setBulkBusy(true);
    try {
      const res = await bulkApproveMembershipApplications(selectedIds);
      flash(
        "success",
        `${res.approved} application${res.approved !== 1 ? "s" : ""} approved.`
      );
      setSelectedIds([]);
      router.refresh();
    } catch (err: any) {
      flash(
        "error",
        err instanceof Error ? err.message : "Failed to approve applications."
      );
    } finally {
      setBulkBusy(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "pending", label: "Pending", count: pending.length },
    { key: "approved", label: "Approved", count: approved.length },
    { key: "rejected", label: "Rejected", count: rejected.length },
  ];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {message && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border animate-in slide-in-from-bottom-5 duration-300 ${
            message.kind === "success"
              ? "bg-emerald-950 text-emerald-200 border-emerald-800/50"
              : "bg-red-950 text-red-200 border-red-800/50"
          }`}
        >
          {message.kind === "success" ? (
            <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
          ) : (
            <XCircle size={18} className="text-red-400 flex-shrink-0" />
          )}
          <span className="text-sm font-semibold">{message.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link
              href="/club/dashboard"
              className="flex items-center gap-1.5 font-semibold text-primary hover:underline"
            >
              <ArrowLeft size={14} />
              Dashboard
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-semibold">
              {clubName} · Applications
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-primary" />
            Membership Applications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review the joining details students submitted, then approve or
            reject — only approved students become members.
          </p>
        </div>
        {clubSlug && (
          <a
            href={`/clubs/${clubSlug}#members`}
            target="_blank"
            rel="noreferrer"
            className="bg-white border-2 border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl hover:border-primary/50 hover:text-primary transition-all text-sm flex items-center gap-2 self-start"
          >
            <UserCheck size={16} />
            View Public Roster
          </a>
        )}
      </div>

      {/* Instant-join notice */}
      {!requiresApproval && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-800">
          <Info size={18} className="text-sky-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm leading-relaxed">
            <strong>Joining is currently instant.</strong> Students become
            members immediately when they apply, so nothing is waiting here. To
            review applications before accepting members, turn on{" "}
            <em>“Review applications before accepting members”</em> in{" "}
            <Link
              href="/club/dashboard"
              className="font-bold text-sky-900 underline"
            >
              Profile &amp; About Editor
            </Link>
            .
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Clock size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Awaiting Review
            </p>
            <p className="text-2xl font-black text-slate-900">
              {pending.length}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Approved Members
            </p>
            <p className="text-2xl font-black text-slate-900">
              {approved.length}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <XCircle size={20} className="text-red-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Rejected
            </p>
            <p className="text-2xl font-black text-slate-900">
              {rejected.length}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex border-b border-slate-200 gap-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setSelectedIds([]);
              }}
              className={`pb-3 font-bold text-sm flex items-center gap-2 transition-colors relative ${
                tab === t.key
                  ? "text-primary border-b-2 border-primary"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {t.label}
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  tab === t.key
                    ? "bg-primary/10 text-primary"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search name, email, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm w-full md:w-72 focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
      </div>

      {/* Bulk approve (pending tab only) */}
      {tab === "pending" && selectedIds.length > 0 && (
        <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 animate-in fade-in duration-200">
          <p className="text-sm font-semibold text-emerald-800">
            {selectedIds.length} application
            {selectedIds.length !== 1 ? "s" : ""} selected
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleBulkApprove}
              disabled={bulkBusy}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
              {bulkBusy ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCheck size={14} />
              )}
              Approve Selected
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center space-y-3">
          <FileText
            size={36}
            className="mx-auto text-slate-300"
          />
          <h3 className="font-bold text-slate-700">
            {tab === "pending"
              ? "No applications awaiting review"
              : tab === "approved"
              ? "No approved members yet"
              : "No rejected applications"}
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            {tab === "pending"
              ? "When students apply to join, their form details will appear here for review."
              : "Applications you process will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => {
            const entries = answerEntries(a);
            const pill = STATUS_PILL[a.status] || {
              label: a.status,
              className: "bg-slate-100 text-slate-600 border-slate-200",
            };
            return (
              <div
                key={a.id}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="p-5 sm:p-6">
                  {/* Identity row */}
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-primary font-bold text-sm">
                          {a.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">
                          {a.user.name}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Mail size={12} className="shrink-0" />
                          {a.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${pill.className}`}
                      >
                        {a.status === "APPROVED" ? (
                          <CheckCircle2 size={12} />
                        ) : a.status === "REJECTED" ? (
                          <XCircle size={12} />
                        ) : (
                          <Clock size={12} />
                        )}
                        {pill.label}
                      </span>
                      {tab === "pending" && (
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(a.id)}
                            onChange={() => toggleSelect(a.id)}
                            className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap size={13} className="text-slate-400" />
                      {a.user.department || "N/A"}
                      {a.user.yearOfStudy
                        ? ` · ${a.user.yearOfStudy}`
                        : ""}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-400" />
                      Applied{" "}
                      {new Date(a.joinedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Form answers */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {entries.map((e, i) => (
                      <div
                        key={i}
                        className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5"
                      >
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {e.label}
                        </p>
                        {/^https?:\/\/.+\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(
                          e.value
                        ) ? (
                          <a
                            href={e.value}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-semibold text-primary hover:underline break-all"
                          >
                            View uploaded image ↗
                          </a>
                        ) : (
                          <p className="text-sm font-semibold text-slate-800 break-words mt-0.5">
                            {e.value}
                          </p>
                        )}
                      </div>
                    ))}
                    {entries.length === 0 && (
                      <p className="text-xs text-slate-400 italic sm:col-span-2">
                        No form details were submitted with this application.
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {tab === "pending" && (
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleReject(a.id)}
                        disabled={busyId === a.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-60"
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(a.id)}
                        disabled={busyId === a.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-60"
                      >
                        {busyId === a.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}
                        Approve &amp; Add Member
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
