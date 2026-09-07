"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  Grid3X3,
  List,
  SlidersHorizontal,
  Heart,
  Users,
  ExternalLink,
  Building2,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ClubItem {
  id: string;
  name: string;
  tagline: string | null;
  description: string;
  logoUrl: string | null;
  slug: string | null;
  _count: { members: number; events: number };
}

interface ClubsDirectoryProps {
  clubs: ClubItem[];
  onViewClub?: (clubId: string) => void;
}

// ─── ClubsDirectory Component ────────────────────────────────────────────────

export default function ClubsDirectory({ clubs, onViewClub }: ClubsDirectoryProps) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // Ctrl+K to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const filteredClubs = clubs.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (club.tagline?.toLowerCase() ?? "").includes(searchQuery.toLowerCase()) ||
      club.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="animate-in">
      {/* Header */}
      <section className="mb-10">
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">
          Browse Clubs
        </h1>
        <p className="text-secondary text-body-lg max-w-2xl mb-8">
          Discover communities that match your passion, from technical engineering
          guilds to creative arts collectives.
        </p>

        {/* Search & Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-xl">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or interest..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white shadow-sm transition-all text-body-lg outline-none"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* View Switcher */}
            <div className="bg-surface-container-high p-1 rounded-xl flex items-center shadow-inner border border-outline-variant">
              <button
                onClick={() => setView("grid")}
                className={`p-2 rounded-lg transition-all flex items-center justify-center ${
                  view === "grid" ? "bg-white shadow-sm" : ""
                }`}
              >
                <Grid3X3 size={18} className="text-on-surface-variant" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-2 rounded-lg transition-all flex items-center justify-center ${
                  view === "list" ? "bg-white shadow-sm" : ""
                }`}
              >
                <List size={18} className="text-on-surface-variant" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Club Grid/List */}
      <div
        className={
          view === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 gap-6 transition-all"
            : "flex flex-col gap-4 transition-all"
        }
      >
        {filteredClubs.map((club) => (
          <div
            key={club.id}
            className={`group bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all flex ${
              view === "grid"
                ? "flex-col p-6 h-full"
                : "flex-row items-center gap-6 p-4"
            }`}
          >
            {/* Logo & Category */}
            <div
              className={`flex ${
                view === "grid"
                  ? "justify-between items-start mb-6"
                  : "items-center gap-4"
              }`}
            >
              <div
                className={`bg-surface-container-low border border-primary/20 flex items-center justify-center overflow-hidden rounded-2xl border ${
                  view === "grid" ? "w-16 h-16" : "w-14 h-14 shrink-0"
                }`}
              >
                {club.logoUrl ? (
                  <img
                    src={club.logoUrl}
                    alt={club.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <Building2 size={24} className="text-primary" />
                )}
              </div>
            </div>

            {/* Content */}
            <div className={view === "grid" ? "" : "flex-1 min-w-0"}>
              <div
                className={
                  view === "list"
                    ? "flex items-center justify-between gap-4"
                    : ""
                }
              >
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                    {club.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 mb-3">
                    <Users size={14} className="text-muted" />
                    <span className="text-body-md text-muted">
                      {club._count.members.toLocaleString()} Member{club._count.members !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
              <p
                className={`text-secondary text-body-md ${
                  view === "grid" ? "flex-grow mb-6" : ""
                }`}
              >
                {club.tagline || club.description}
              </p>
            </div>

            {/* Actions */}
            <div
              className={`${
                view === "grid"
                  ? "flex items-center gap-3 pt-4 border-t border-slate-100 mt-auto"
                  : "flex items-center gap-3 shrink-0"
              }`}
            >
              <button
                onClick={() => onViewClub?.(club.id)}
                className="flex-grow bg-white border border-slate-200 text-on-surface font-bold py-2.5 rounded-xl hover:bg-surface-container-low transition-colors text-body-md flex items-center justify-center gap-2"
              >
                View Profile
                <ExternalLink size={14} />
              </button>
              <button className="w-11 h-11 flex items-center justify-center rounded-xl border border-slate-200 text-secondary hover:text-primary hover:border-primary transition-all">
                <Heart size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredClubs.length === 0 && (
        <div className="text-center py-20">
          <Building2 size={48} className="mx-auto text-muted mb-4" />
          <h3 className="font-headline-sm text-on-surface mb-2">
            {clubs.length === 0 ? "No clubs found" : "No clubs match your search"}
          </h3>
          <p className="text-muted text-body-md">
            {clubs.length === 0
              ? "Clubs will appear here once they're created by the admin."
              : "Try adjusting your search criteria."}
          </p>
        </div>
      )}
    </div>
  );
}
