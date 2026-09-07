"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FormFieldSchema, FormResponsesPayload } from "@/types/formBuilder";
import { toggleAttendance } from "@/app/actions/eventActions";
import {
  Download,
  Search,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  ArrowLeft,
  Filter,
  Building2,
  Check,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface RegistrationWithUser {
  id: string;
  userId: string;
  eventId: string;
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

interface ResponsesDashboardProps {
  eventId: string;
  eventTitle: string;
  eventCapacity: number;
  clubName: string;
  formSchema: FormFieldSchema[];
  registrations: RegistrationWithUser[];
  teams?: any[];
  isTeamEvent?: boolean;
  backUrl?: string;
  isClosed?: boolean;
}

export default function ResponsesDashboard({
  eventId,
  eventTitle,
  eventCapacity,
  clubName,
  formSchema = [],
  registrations = [],
  teams = [],
  isTeamEvent = false,
  backUrl = "/club/dashboard",
  isClosed = false,
}: ResponsesDashboardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAttended, setFilterAttended] = useState<"ALL" | "YES" | "NO">("ALL");

  const handleToggleAttendance = async (regId: string, currentStatus: string) => {
    if (isClosed) return;
    const isCurrentlyAttended = currentStatus === "ATTENDED";
    startTransition(async () => {
      try {
        await toggleAttendance(regId, !isCurrentlyAttended);
        router.refresh();
      } catch (err: any) {
        alert(err.message || "Failed to toggle attendance");
      }
    });
  };

  // Filter registrations by name / email & attendance
  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reg.user.department || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAttendance =
      filterAttended === "ALL"
        ? true
        : filterAttended === "YES"
        ? reg.status === "ATTENDED"
        : reg.status !== "ATTENDED";

    return matchesSearch && matchesAttendance;
  });

  const hasExternalPasses = registrations.some((reg) => (reg.formResponses as any)?.passUrl);

  // Calculate metrics
  const totalRegistered = registrations.length;
  const totalAttended = registrations.filter((r) => r.status === "ATTENDED").length;
  const capacityPercent = Math.round(
    (totalRegistered / Math.max(eventCapacity, 1)) * 100
  );

  // Client-side CSV Exporter
  const handleExportCSV = () => {
    const baseHeaders = [
      "Student Name",
      "Email",
      "Department",
      "Year of Study",
      "Registration Date",
      "Attended Status",
    ];
    if (hasExternalPasses) {
      baseHeaders.push("Pass URL");
    }

    const dynamicHeaders = formSchema.map((f) => f.label);
    const headers = [...baseHeaders, ...dynamicHeaders];

    const csvRows = filteredRegistrations.map((reg) => {
      const responses = (reg.formResponses as FormResponsesPayload) || {};

      const baseCols = [
        `"${(reg.user.name || "").replace(/"/g, '""')}"`,
        `"${(reg.user.email || "").replace(/"/g, '""')}"`,
        `"${(reg.user.department || "N/A").replace(/"/g, '""')}"`,
        `"${(reg.user.yearOfStudy || "N/A").replace(/"/g, '""')}"`,
        `"${new Date(reg.createdAt).toLocaleString()}"`,
        `"${reg.status === "ATTENDED" ? "Attended" : "Registered"}"`,
      ];
      if (hasExternalPasses) {
        baseCols.push(`"${(responses as any).passUrl || "-"}"`);
      }

      const dynamicCols = formSchema.map((field) => {
        const val = responses[field.id];
        if (Array.isArray(val)) {
          return `"${val.join(", ").replace(/"/g, '""')}"`;
        }
        return `"${(val || "-").toString().replace(/"/g, '""')}"`;
      });

      return [...baseCols, ...dynamicCols].join(",");
    });

    const csvString = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const slug = eventTitle.toLowerCase().replace(/[^a-z0-9]/g, "-");

    link.setAttribute("href", url);
    link.setAttribute("download", `${slug}-responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Response Manager
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-slate-500 text-xs font-medium">
                  {clubName}
                </span>
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                {eventTitle} — Student Registrations
              </h1>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={registrations.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-40 active:scale-95"
          >
            <Download size={15} />
            Export Responses CSV
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-8 space-y-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users size={22} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Total Registrations
              </span>
              <div className="text-2xl font-black text-slate-900">
                {totalRegistered} / {eventCapacity}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Capacity Filled
              </span>
              <div className="text-2xl font-black text-slate-900">
                {capacityPercent}%
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Attended Students
              </span>
              <div className="text-2xl font-black text-slate-900">
                {totalAttended}
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Box */}
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

          {/* Filter Pills */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
              <Filter size={13} /> Filter:
            </span>
            {(["ALL", "YES", "NO"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterAttended(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterAttended === status
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status === "ALL"
                  ? "All"
                  : status === "YES"
                  ? "Attended"
                  : "Not Attended"}
              </button>
            ))}
          </div>
        </div>

        {/* Responses View */}
        {isTeamEvent ? (
          <div className="space-y-4">
            {teams.length === 0 ? (
              <div className="p-12 bg-white rounded-2xl border border-slate-200 shadow-sm text-center text-slate-400 font-medium">
                No teams have registered yet.
              </div>
            ) : (
              teams.map((team) => (
                <div key={team.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        {team.name}
                        {team.externalPassUrl && (
                          <a
                            href={team.externalPassUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full hover:bg-emerald-200 flex items-center gap-1"
                          >
                            Team Pass <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </h3>
                      <div className="text-xs text-slate-500 mt-1 font-mono">
                        Join Code: {team.joinCode}
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                      {team.members.length} Members
                    </div>
                  </div>
                  <div className="p-0">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-white border-b border-slate-100">
                        <tr>
                          <th className="p-4 font-bold text-slate-400 uppercase tracking-wider">Member Name</th>
                          <th className="p-4 font-bold text-slate-400 uppercase tracking-wider">Role</th>
                          <th className="p-4 font-bold text-slate-400 uppercase tracking-wider text-center">Attendance</th>
                          {hasExternalPasses && (
                            <th className="p-4 font-bold text-slate-400 uppercase tracking-wider">Pass URL</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {team.members.map((member: any) => {
                          const userReg = registrations.find(r => r.userId === member.userId);
                          const isCaptain = member.userId === team.leaderId;
                          
                          return (
                            <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-4">
                                <div className="font-bold text-slate-900">{member.user.name}</div>
                                <div className="text-slate-500 font-mono text-[10px]">{member.user.email}</div>
                              </td>
                              <td className="p-4">
                                {isCaptain ? (
                                  <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                    Captain
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-[10px] font-bold uppercase">
                                    Member
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-center">
                                {userReg ? (
                                  <button
                                    type="button"
                                    disabled={isPending || isClosed}
                                    onClick={() => handleToggleAttendance(userReg.id, userReg.status)}
                                    className={`w-6 h-6 rounded border flex items-center justify-center mx-auto transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed ${
                                      userReg.status === "ATTENDED"
                                        ? "bg-emerald-500 border-emerald-500 text-white"
                                        : "bg-white border-slate-300 text-transparent hover:border-slate-400"
                                    }`}
                                    title={userReg.status === "ATTENDED" ? "Mark Absent" : "Mark Attended"}
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                              {hasExternalPasses && (
                                <td className="p-4">
                                  {member.externalPassUrl ? (
                                    <a
                                      href={member.externalPassUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline text-xs flex items-center gap-1 font-medium"
                                    >
                                      View Pass <ExternalLink className="w-3 h-3" />
                                    </a>
                                  ) : (
                                    <span className="text-slate-300">-</span>
                                  )}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="p-4 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-slate-50">
                      #
                    </th>
                    <th className="p-4 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-slate-50">
                      Student Name
                    </th>
                    <th className="p-4 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-slate-50">
                      Email
                    </th>
                    <th className="p-4 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-slate-50">
                      Department / Year
                    </th>
                    <th className="p-4 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-slate-50">
                      Registration Date
                    </th>
                    <th className="p-4 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-slate-50 text-center">
                      Attendance
                    </th>
                    
                    {hasExternalPasses && (
                      <th className="p-4 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-slate-50">
                        Pass URL
                      </th>
                    )}

                    {/* Dynamic Form Schema Columns */}
                    {formSchema.map((field) => (
                      <th
                        key={field.id}
                        className="p-4 font-bold text-primary uppercase tracking-wider whitespace-nowrap bg-slate-50 border-l border-slate-200/60"
                      >
                        {field.label}{" "}
                        {field.isRequired && (
                          <span className="text-red-500">*</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td
                        colSpan={hasExternalPasses ? 6 + formSchema.length : 5 + formSchema.length}
                        className="p-12 text-center text-slate-400 font-medium"
                      >
                        No student registrations match your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((reg, idx) => {
                      const responses =
                        (reg.formResponses as FormResponsesPayload) || {};

                      return (
                        <tr
                          key={reg.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="p-4 font-mono text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="p-4 font-bold text-slate-900 whitespace-nowrap">
                            {reg.user.name}
                          </td>
                          <td className="p-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                            {reg.user.email}
                          </td>
                          <td className="p-4 text-slate-600 whitespace-nowrap">
                            {reg.user.department || "N/A"}{" "}
                            {reg.user.yearOfStudy && `(${reg.user.yearOfStudy})`}
                          </td>
                          <td className="p-4 text-slate-500 whitespace-nowrap">
                            {new Date(reg.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </td>

                          {/* Attendance Toggle */}
                          <td className="p-4 text-center">
                            <button
                              type="button"
                              disabled={isPending || isClosed}
                              onClick={() => handleToggleAttendance(reg.id, reg.status)}
                              className={`w-6 h-6 rounded border flex items-center justify-center mx-auto transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed ${
                                reg.status === "ATTENDED"
                                  ? "bg-emerald-500 border-emerald-500 text-white"
                                  : "bg-white border-slate-300 text-transparent hover:border-slate-400"
                              }`}
                              title={reg.status === "ATTENDED" ? "Mark Absent" : "Mark Attended"}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </td>

                          {hasExternalPasses && (
                            <td className="p-4 text-slate-600 whitespace-nowrap border-l border-slate-100">
                              {(responses as any).passUrl ? (
                                <a
                                  href={(responses as any).passUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline text-xs flex items-center gap-1 font-medium"
                                >
                                  View Pass <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="text-slate-300 font-mono text-[11px]">-</span>
                              )}
                            </td>
                          )}

                          {/* Render Dynamic Field Answers */}
                          {formSchema.map((field) => {
                            const val = responses[field.id];
                            return (
                              <td
                                key={field.id}
                                className="p-4 text-slate-800 border-l border-slate-100 min-w-[160px] max-w-[280px]"
                              >
                                {Array.isArray(val) ? (
                                  <div className="flex flex-wrap gap-1">
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
                                  <span className="font-medium">{val}</span>
                                ) : (
                                  <span className="text-slate-300 font-mono text-[11px]">
                                    -
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
