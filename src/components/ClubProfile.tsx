"use client";

import { useState, useEffect } from "react";
import {
  Globe,
  Github,
  Instagram,
  Link as LinkIcon,
  Users,
  Calendar,
  Building2,
  Shield,
  ArrowLeft,
  Ticket,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RealClubData {
  id: string;
  name: string;
  tagline: string | null;
  description: string;
  logoUrl: string | null;
  coverUrl: string | null;
  about: string | null;
  website: string | null;
  github: string | null;
  instagram: string | null;
  slug: string | null;
  members: {
    id: string;
    userId: string;
    clubRole: string;
    user: { id: string; name: string; email: string };
  }[];
  events: {
    id: string;
    title: string;
    description: string;
    location: string;
    startDate: string;
    totalSeats: number;
  }[];
  _count: { members: number; events: number };
}

interface ClubProfileProps {
  clubId?: string;
  onBackToClubs?: () => void;
}

// ─── ClubProfile Component ───────────────────────────────────────────────────

export default function ClubProfile({ clubId, onBackToClubs }: ClubProfileProps) {
  const [club, setClub] = useState<RealClubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchClub() {
      if (!clubId) {
        setLoading(false);
        setError(true);
        return;
      }
      try {
        const { getClubById } = await import(
          "@/app/actions/unifiedActions"
        );
        const found = await getClubById(clubId);
        if (found) {
          setClub(found as unknown as RealClubData);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Failed to fetch club:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchClub();
  }, [clubId]);

  if (loading) {
    return (
      <div className="animate-in text-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted">Loading club...</p>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="animate-in text-center py-20">
        <Building2 size={48} className="mx-auto text-muted mb-4" />
        <h2 className="font-headline-sm text-on-surface mb-2">Club not found</h2>
        <p className="text-muted text-body-md mb-6">
          This club could not be loaded.
        </p>
        <button
          onClick={onBackToClubs}
          className="text-primary font-bold hover:underline"
        >
          &larr; Back to Clubs
        </button>
      </div>
    );
  }

  const leaderMembership = club.members.find(
    (m) => m.clubRole === "LEADER"
  );
  const officers = club.members.filter(
    (m) => m.clubRole === "OFFICER" || m.clubRole === "TREASURER"
  );

  return (
    <div className="animate-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-8 font-label-mono text-sm">
        <button
          onClick={onBackToClubs}
          className="text-muted hover:text-primary transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          Clubs
        </button>
        <span className="text-muted">/</span>
        <span className="text-on-surface font-bold">{club.name}</span>
      </nav>

      {/* Club Header */}
      <section className="flex flex-col items-center text-center mb-12">
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-surface rounded-3xl border-2 border-border-subtle flex items-center justify-center shadow-sm overflow-hidden p-4">
            {club.logoUrl ? (
              <img
                className="w-full h-full object-contain rounded-xl"
                src={club.logoUrl}
                alt={`${club.name} Logo`}
              />
            ) : (
              <Building2 size={36} className="text-primary" />
            )}
          </div>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-3 tracking-tight">
          {club.name}
        </h1>
        {club.tagline && (
          <p className="max-w-2xl text-muted text-body-lg mb-6">
            {club.tagline}
          </p>
        )}
        {!club.tagline && club.description && (
          <p className="max-w-2xl text-muted text-body-lg mb-6">
            {club.description}
          </p>
        )}
        <div className="flex items-center gap-6 flex-wrap justify-center">
          {club.website && (
            <a
              href={club.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-secondary font-body-md hover:text-primary transition-colors"
            >
              <Globe size={18} />
              <span>Website</span>
            </a>
          )}
          <div className="flex items-center gap-2 text-secondary font-body-md">
            <Users size={18} />
            <span>{club._count.members} Member{club._count.members !== 1 ? "s" : ""}</span>
          </div>
          {leaderMembership && (
            <div className="flex items-center gap-2 text-amber-600 font-body-md">
              <Shield size={18} />
              <span>Led by {leaderMembership.user.name}</span>
            </div>
          )}
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - About */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <div className="bg-surface rounded-2xl border border-border-subtle p-8 shadow-sm">
            <h3 className="font-headline-md text-headline-md mb-4 text-on-surface">
              About
            </h3>
            <div className="text-muted text-body-lg leading-relaxed whitespace-pre-line">
              {club.about || club.description || "No description provided yet."}
            </div>
          </div>

          {/* Events */}
          <div className="bg-surface rounded-2xl border border-border-subtle p-8 shadow-sm">
            <h3 className="font-headline-md text-headline-md mb-6 text-on-surface">
              Events
            </h3>
            {club.events.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={40} className="mx-auto text-muted mb-3" />
                <p className="text-muted text-body-md">
                  No events yet for this club.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {club.events.slice(0, 10).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 p-4 rounded-xl bg-surface-container-low border border-border-subtle"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Calendar size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-base text-on-surface">
                        {event.title}
                      </h4>
                      <p className="text-sm text-muted mt-1 line-clamp-1">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(event.startDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Ticket size={12} />
                          {event.totalSeats} seats
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Leader */}
          {leaderMembership && (
            <div className="bg-surface rounded-2xl border border-border-subtle p-6 shadow-sm">
              <h4 className="font-bold text-on-surface mb-4">Club Leader</h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-100 border-2 border-violet-200 flex items-center justify-center">
                  <span className="text-violet-700 font-bold text-sm">
                    {leaderMembership.user.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-on-surface text-sm">
                    {leaderMembership.user.name}
                  </p>
                  <p className="text-xs text-muted">

                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Officers */}
          {officers.length > 0 && (
            <div className="bg-surface rounded-2xl border border-border-subtle p-6 shadow-sm">
              <h4 className="font-bold text-on-surface mb-4">Officers</h4>
              <div className="space-y-3">
                {officers.map((m) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center">
                      <span className="text-blue-700 font-bold text-xs">
                        {m.user.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-on-surface">
                        {m.user.name}
                      </p>
                      <span className="text-[10px] font-bold uppercase text-amber-600">
                        {m.clubRole === "TREASURER" ? "Treasurer" : "Officer"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="bg-surface rounded-2xl border border-border-subtle p-6 shadow-sm">
            <h4 className="font-bold text-on-surface mb-4">Stats</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Total Members</span>
                <span className="font-bold text-on-surface">
                  {club._count.members}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Total Events</span>
                <span className="font-bold text-on-surface">
                  {club._count.events}
                </span>
              </div>
            </div>
          </div>

          {/* Social Links */}
          {(club.website || club.github || club.instagram) && (
            <div className="bg-surface rounded-2xl border border-border-subtle p-6 shadow-sm">
              <h4 className="font-bold text-on-surface mb-4">Connect</h4>
              <div className="space-y-3">
                {club.website && (
                  <a
                    href={club.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-muted hover:text-primary transition-colors"
                  >
                    <Globe size={16} />
                    <span>Website</span>
                  </a>
                )}
                {club.github && (
                  <a
                    href={club.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-muted hover:text-primary transition-colors"
                  >
                    <Github size={16} />
                    <span>GitHub</span>
                  </a>
                )}
                {club.instagram && (
                  <a
                    href={club.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-muted hover:text-primary transition-colors"
                  >
                    <Instagram size={16} />
                    <span>Instagram</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Join Card */}
          <div className="bg-primary text-white rounded-2xl p-6 shadow-md relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="font-bold text-lg mb-2">Join the Club</h4>
              <p className="text-white/80 text-sm mb-4">
                We are always looking for new builders and creators.
              </p>
              <button className="w-full bg-white text-primary font-bold py-2.5 rounded-xl hover:bg-opacity-90 transition-all active:scale-95">
                Get Involved
              </button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
