"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { getAdminUsersList } from "@/app/actions/adminUsers";
import type { AdminUserResult } from "@/app/actions/adminUsers";
import { Search, Users, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────

const YEARS = [
  { value: "", label: "All Years" },
  { value: "1", label: "1st Year" },
  { value: "2", label: "2nd Year" },
  { value: "3", label: "3rd Year" },
  { value: "4", label: "4th Year" },
];

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

function yearLabel(year: string | null): string {
  if (!year) return "";
  return YEAR_LABELS[year] ?? year;
}

const PAGE_SIZE = 10;

// ─── Club Role Badge Helpers ─────────────────────────────────────────────

const ROLE_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  LEADER: { label: "Lead", bg: "bg-primary", text: "text-white" },
  OFFICER: { label: "Officer", bg: "bg-tertiary", text: "text-white" },
  TREASURER: { label: "Treasurer", bg: "bg-amber-600", text: "text-white" },
  MEMBER: { label: "Member", bg: "bg-slate-500", text: "text-white" },
};

function getRoleBadge(clubRole: string) {
  return ROLE_BADGES[clubRole] ?? { label: clubRole, bg: "bg-slate-500", text: "text-white" };
}

// ─── Avatar component ────────────────────────────────────────────────────

function StudentAvatar({ name }: { name: string }) {
  // Generate a consistent color from name
  const colors = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-violet-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
  ];
  const colorIndex =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`w-12 h-12 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-sm shrink-0`}
    >
      {initials}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────

export default function AdminStudentsClient({
  initialUsers,
  departments,
  totalCount,
}: {
  initialUsers: AdminUserResult[];
  departments: string[];
  totalCount: number;
}) {
  const [users, setUsers] = useState<AdminUserResult[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const paginatedUsers = users.slice(0, PAGE_SIZE);
  const from = (currentPage - 1) * PAGE_SIZE + 1;
  const to = Math.min(currentPage * PAGE_SIZE, totalCount);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await getAdminUsersList({
          search: searchQuery || undefined,
          department: departmentFilter || undefined,
          yearOfStudy: yearFilter || undefined,
        });
        setUsers(results);
        setCurrentPage(1);
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, departmentFilter, yearFilter]);

  // Ctrl+K to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setDepartmentFilter("");
    setYearFilter("");
  }, []);

  const hasActiveFilters = searchQuery || departmentFilter || yearFilter;

  return (
    <>
      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          {/* Search */}
          <div className="flex-1 w-full">
            <label className="block font-label-caps text-label-caps text-secondary mb-2 uppercase">
              Search Students
            </label>
            <div className="relative group">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-12 pr-4 py-3 bg-[#f8fafc] border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md text-body-md"
              />
              <kbd className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-white border border-slate-200 rounded-md font-label-mono text-label-mono text-muted hidden sm:inline-block">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Department Filter */}
          <div className="w-full lg:w-48">
            <label className="block font-label-caps text-label-caps text-secondary mb-2 uppercase">
              Department
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full py-3 px-4 bg-[#f8fafc] border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md appearance-none cursor-pointer"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="w-full lg:w-40">
            <label className="block font-label-caps text-label-caps text-secondary mb-2 uppercase">
              Year
            </label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full py-3 px-4 bg-[#f8fafc] border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md appearance-none cursor-pointer"
            >
              {YEARS.map((y) => (
                <option key={y.value} value={y.value}>
                  {y.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="pb-3 px-2 font-label-caps text-label-caps text-primary hover:text-primary/70 transition-colors whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 font-label-caps text-label-caps text-secondary uppercase tracking-wider">
                  Student Profile
                </th>
                <th className="px-6 py-4 font-label-caps text-label-caps text-secondary uppercase tracking-wider">
                  Academic Info
                </th>
                <th className="px-6 py-4 font-label-caps text-label-caps text-secondary uppercase tracking-wider">
                  Club Memberships
                </th>
                <th className="px-6 py-4 font-label-caps text-label-caps text-secondary uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <Users size={40} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-secondary font-body-md text-body-md">
                      {hasActiveFilters
                        ? "No students match your filters."
                        : "No students registered yet."}
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="mt-3 text-primary font-bold text-sm hover:underline"
                      >
                        Clear all filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
              {paginatedUsers.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  {/* Student Profile */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <StudentAvatar name={student.name} />
                      <div>
                        <p className="font-headline-sm text-headline-sm text-on-surface">
                          {student.name}
                        </p>
                        <p className="font-label-mono text-label-mono text-muted">

                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Academic Info */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      {student.yearOfStudy ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-fixed text-on-primary-fixed w-fit">
                          {yearLabel(student.yearOfStudy)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 w-fit">
                          N/A
                        </span>
                      )}
                      <span className="font-body-md text-body-md text-secondary">
                        {student.department || "No department"}
                      </span>
                    </div>
                  </td>

                  {/* Club Memberships */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {student.memberships.length === 0 ? (
                        <span className="text-muted text-sm italic">
                          No clubs
                        </span>
                      ) : (
                        student.memberships.map((m) => {
                          const badge = getRoleBadge(m.clubRole);
                          return (
                            <div
                              key={`${student.id}-${m.club.name}`}
                              className="flex items-center bg-slate-100 rounded-lg pr-2 py-0.5 pl-0.5 border border-transparent hover:border-primary/30 transition-all group/badge"
                            >
                              <span
                                className={`font-label-mono text-[10px] ${badge.bg} ${badge.text} px-1.5 py-0.5 rounded-md mr-2 uppercase`}
                              >
                                {badge.label}
                              </span>
                              <span className="font-label-caps text-[11px] text-on-surface whitespace-nowrap">
                                {m.club.name}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="bg-[#f8fafc] border border-slate-200 text-on-surface px-4 py-2 rounded-xl font-bold text-xs hover:bg-white hover:border-primary transition-all">
                        View Profile
                      </button>
                      <button className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                        <MoreVertical size={16} className="text-outline" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalCount > PAGE_SIZE && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
            <p className="font-body-md text-body-md text-secondary">
              Showing {from}–{Math.min(to, users.length)} of{" "}
              {totalCount.toLocaleString()} students
            </p>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 rounded-xl hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} className="text-outline" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                // Show pages around current
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                      currentPage === pageNum
                        ? "bg-primary text-white shadow-sm"
                        : "border border-slate-200 hover:bg-white"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <span className="px-2 text-secondary">...</span>
              )}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-sm hover:bg-white transition-all"
                >
                  {totalPages}
                </button>
              )}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 rounded-xl hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} className="text-outline" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
