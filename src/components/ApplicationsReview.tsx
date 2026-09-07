"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormFieldSchema, FormResponsesPayload } from "@/types/formBuilder";
import {
  approveEventRegistration,
  rejectEventRegistration,
  bulkApproveEventRegistrations,
} from "@/app/actions/eventFormActions";
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
} from "lucide-react";

interface ApplicationWithUser {
  id: string;
  userId: string;
  formResponses: any;
  status: string;
  createdAt: Date | string;
  user: {
    id: string;
    name: string;
    email: string;
    department?: string | null;
    yearOfStudy?: string | null;
    division?: string | null;
  };
}

interface ApplicationsReviewProps {
  eventId: string;
  eventTitle: string;
  eventCapacity: number;
  clubName: string;
  formSchema: FormFieldSchema[];
  registrations: ApplicationWithUser[];
  backUrl?: string;
}

type Tab = "pending" | "selected" | "rejected";

const STATUS_PILL: Record<
  string,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  REGISTERED: {
    label: "Selected",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  ATTENDED: {
    label: "Selected · Attended",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-50 text-red-600 border-red-200",
  },
};

export default function ApplicationsReview({
  eventId,
  eventTitle,
  eventCapacity,
  clubName,
  formSchema = [],
  registrations = [],
  backUrl = "/club/dashboard",
}: ApplicationsReviewProps) {
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
    () => registrations.filter((r) => r.status === "PENDING"),
    [registrations]
  );
  const selected = useMemo(
    () =>
      registrations.filter(
        (r) => r.status === "REGISTERED" || r.status === "ATTENDED"
      ),
    [registrations]
  );
  const rejected = useMemo(
    () => registrations.filter((r) => r.status === "REJECTED"),
    [registrations]
  );

  const currentList =
    tab === "pending" ? pending : tab === "selected" ? selected : rejected;

  const filtered = currentList.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      r.user.name.toLowerCase().includes(q) ||
      r.user.email.toLowerCase().includes(q) ||
      (r.user.department || "").toLowerCase().includes(q)
    );
  });

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((r) => selectedIds.includes(r.id));

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleSelectAll = () => {
    const ids = filtered.map((r) => r.id);
    setSelectedIds((prev) =>
      allFilteredSelected
        ? prev.filter((id) => !ids.includes(id))
        : Array.from(new Set([...prev, ...ids]))
    );
  };

  const handleApprove = async (id: string) => {
    setBusyId(id);
    setMessage(null);
    try {
      await approveEventRegistration(id);
      router.refresh();
    } catch (err: any) {
      setMessage({ kind: "error", text: err.message || "Approval failed." });
      setBusyId(null);
    }
  };

  const handleReject = async (id: string) => {
    setBusyId(id);
    setMessage(null);
    try {
      await rejectEventRegistration(id);
      router.refresh();
    } catch (err: any) {
      setMessage({ kind: "error", text: err.message || "Rejection failed." });
      setBusyId(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0 || bulkBusy) return;
    setBulkBusy(true);
    setMessage(null);
    try {
      const res = await bulkApproveEventRegistrations(selectedIds);
      setMessage({
        kind: "success",
        text:
          res.skipped > 0
            ? `${res.approved} applicant(s) selected — ${res.skipped} skipped because the capacity limit was reached.`
            : `${res.approved} applicant(s) selected and granted passes.`,
      });
      setSelectedIds([]);
      router.refresh();
    } catch (err: any) {
      setMessage({
        kind: "error",
        text: err.message || "Bulk approval failed.",
      });
    } finally {
      setBulkBusy(false);
    }
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "pending", label: "Pending", count: pending.length },
    { key: "selected", label: "Selected", count: selected.length },
    { key: "rejected", label: "Rejected", count: rejected.length },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-6 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={backUrl}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Application Review
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-slate-500 text-xs font-medium">
                  {clubName}
                </span>
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                {eventTitle} — Select Applicants
              </h1>
            </div>
          </div>

          <button
            onClick={handleBulkApprove}
            disabled={selectedIds.length === 0 || bulkBusy}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-40 active:scale-95"
          >
            {bulkBusy ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <CheckCheck size={15} />
            )}
            {selectedIds.length > 0
              ? `Approve Selected (${selectedIds.length})`
              : "Approve Selected"}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-8 space-y-6">
        {message && (
          <div
            className={`p-4 rounded-2xl border text-sm font-semibold ${
              message.kind === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock size={22} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Pending Review
              </span>
              <div className="text-2xl font-black text-slate-900">
                {pending.length}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Selected (Passes Issued)
              </span>
              <div className="text-2xl font-black text-slate-900">
                {selected.length} / {eventCapacity}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-500 rounded-xl">
              <XCircle size={22} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Rejected
              </span>
              <div className="text-2xl font-black text-slate-900">
                {rejected.length}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setTab(t.key);
                  setSelectedIds([]);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  tab === t.key
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t.label}
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                    tab === t.key
                      ? "bg-white/20"
                      : t.key === "pending"
                      ? "bg-amber-100 text-amber-700"
                      : t.key === "selected"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-80">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name or email..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>

        {/* Application Cards */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center space-y-2">
              <FileText size={36} className="mx-auto text-slate-300" />
              <p className="text-slate-500 font-medium text-sm">
                {tab === "pending"
                  ? "No pending applications. New applications will appear here."
                  : tab === "selected"
                  ? "No students selected yet."
                  : "No rejected applications."}
              </p>
            </div>
          ) : (
            <>
              {tab === "pending" && (
                <div className="flex items-center gap-2 px-1">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    Select all ({filtered.length})
                  </label>
                </div>
              )}

              {filtered.map((app) => {
                const responses =
                  (app.formResponses as FormResponsesPayload) || {};
                const pill = STATUS_PILL[app.status] || STATUS_PILL.PENDING;
                const isBusy = busyId === app.id;
                return (
                  <div
                    key={app.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6"
                  >
                    <div className="flex flex-col lg:flex-row gap-5">
                      {/* Student identity */}
                      <div className="lg:w-72 flex-shrink-0">
                        <div className="flex items-start gap-3">
                          {tab === "pending" && (
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(app.id)}
                              onChange={() => toggleSelect(app.id)}
                              aria-label={`Select ${app.user.name}`}
                              className="mt-1.5 w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900">
                                {app.user.name}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pill.className}`}
                              >
                                {pill.label}
                              </span>
                            </div>
                            <div className="mt-1.5 space-y-1 text-xs text-slate-500">
                              <p className="flex items-center gap-1.5 truncate">
                                <Mail size={12} className="text-slate-400" />
                                {app.user.email}
                              </p>
                              {(app.user.department ||
                                app.user.yearOfStudy) && (
                                <p className="flex items-center gap-1.5">
                                  <GraduationCap
                                    size={12}
                                    className="text-slate-400"
                                  />
                                  {app.user.department || "N/A"}
                                  {app.user.yearOfStudy
                                    ? ` · ${app.user.yearOfStudy}`
                                    : ""}
                                </p>
                              )}
                              <p className="flex items-center gap-1.5">
                                <Calendar
                                  size={12}
                                  className="text-slate-400"
                                />
                                Applied{" "}
                                {new Date(app.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Form responses */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                        {formSchema.length === 0 ? (
                          <p className="text-xs text-slate-400">
                            No additional questions on this form.
                          </p>
                        ) : (
                          formSchema.map((field) => {
                            const val = responses[field.id];
                            return (
                              <div key={field.id}>
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  {field.label}
                                </span>
                                {Array.isArray(val) && val.length > 0 ? (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {val.map((item, i) => (
                                      <span
                                        key={i}
                                        className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-200/60 inline-block"
                                      >
                                        {item}
                                      </span>
                                    ))}
                                  </div>
                                ) : val ? (
                                  <span className="text-xs font-medium text-slate-800 whitespace-pre-line break-words line-clamp-4">
                                    {val}
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-300 font-mono">
                                    -
                                  </span>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Actions */}
                      <div className="lg:w-40 flex-shrink-0 flex lg:flex-col gap-2 lg:justify-center">
                        {app.status === "PENDING" ? (
                          <>
                            <button
                              onClick={() => handleApprove(app.id)}
                              disabled={isBusy}
                              className="flex-1 lg:w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl transition-colors disabled:opacity-50"
                            >
                              {isBusy ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <CheckCircle2 size={14} />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(app.id)}
                              disabled={isBusy}
                              className="flex-1 lg:w-full flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold py-2 rounded-xl transition-colors disabled:opacity-50"
                            >
                              {isBusy ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <XCircle size={14} />
                              )}
                              Reject
                            </button>
                          </>
                        ) : (
                          <div className="text-center lg:pt-1">
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${pill.className}`}
                            >
                              {app.status === "REJECTED" ? (
                                <XCircle size={12} />
                              ) : (
                                <CheckCircle2 size={12} />
                              )}
                              {pill.label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
