import Link from "next/link";
import {
  Building2,
  Users,
  Calendar,
  Globe,
  Github,
  Instagram,
  MessageCircle,
} from "lucide-react";
import ClubJoinFlowButton from "@/components/ClubJoinFlowButton";
import type { ClubJoiningField } from "@/components/ClubJoiningFlow";
import { ClubMark } from "@/components/clubboard/club-identity";

export type ClubHeaderData = {
  id: string;
  name: string;
  slug: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  tagline: string | null;
  description: string;
  category: string | null;
  recruitmentStatus: string;
  website: string | null;
  github: string | null;
  instagram: string | null;
  discord: string | null;
  whatsappGroupUrl: string | null;
  customFormFields: ClubJoiningField[] | null;
  _count: { members: number; events: number };
  members: { userId: string | null }[];
};

type TabKey = "about" | "events" | "feed" | "members";

/**
 * Shared hero header + action bar + tab navigation for public club pages.
 * The Events and Feed tabs link to their dedicated pages
 * (/clubs/[slug]/events and /clubs/[slug]/feed); About and Members tabs are
 * JS-driven tabs on the profile page itself.
 */
export default function ClubProfileHeader({
  club,
  isMember,
  isOpenForMembers,
  hasPendingApplication = false,
  upcomingCount,
  activeTab,
  isOnboardingPreview,
}: {
  club: ClubHeaderData;
  isMember: boolean;
  isOpenForMembers: boolean;
  /** True when the student already applied and is awaiting the club's review. */
  hasPendingApplication?: boolean;
  upcomingCount: number;
  activeTab: TabKey;
  isOnboardingPreview?: boolean;
}) {
  const href = club.slug ? `/clubs/${club.slug}` : `/clubs/${club.id}`;

  const tabs: { key: TabKey; label: string; href: string; jsTab: boolean }[] = [
    { key: "about", label: "About", href, jsTab: true },
    { key: "events", label: "Events", href: `${href}/events`, jsTab: false },
    {
      key: "feed",
      label: "📢 Feed & Updates",
      href: `${href}/feed`,
      jsTab: false,
    },
    { key: "members", label: "Members List", href: `${href}#members`, jsTab: true },
  ];
  const visibleTabs = tabs.filter(
    (t) => !(isOnboardingPreview && t.key === "feed")
  );

  const socials = [
    { key: "website", icon: Globe, label: "Website" },
    { key: "github", icon: Github, label: "GitHub" },
    { key: "instagram", icon: Instagram, label: "Instagram" },
    { key: "discord", icon: MessageCircle, label: "Discord" },
  ] as const;

  return (
    <>
      {/* ── Breadcrumb ── */}
      <nav className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-24 sm:pt-28 flex items-center gap-2 text-sm">
        {isOnboardingPreview ? (
          <Link
            href="/onboarding"
            className="flex items-center gap-1.5 text-primary hover:text-primary-variant transition-colors font-bold bg-primary/10 px-3 py-1.5 rounded-lg"
          >
            ← Back to Selection
          </Link>
        ) : (
          <>
            <Link
              href="/clubs"
              className="text-muted hover:text-primary transition-colors font-medium"
            >
              Clubs
            </Link>
            <span className="text-muted">/</span>
            <span className="text-on-surface font-bold">{club.name}</span>
          </>
        )}
      </nav>

      {/* ══════ Hero Header ══════ */}
      <div className="relative overflow-hidden border-y-2 border-slate-900 bg-[#f6f2e9] py-6 sm:py-10">
        {/* Cover Image */}
        <div
          className="h-48 sm:h-56 bg-gradient-to-br from-primary/30 via-surface-container to-primary/10 relative"
          style={
            club.coverUrl
              ? {
                  backgroundImage: `url(${club.coverUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          {!club.coverUrl && (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-surface-container to-primary/5" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Overlay Profile Info */}
        <div className="relative mx-auto -mt-16 max-w-[1200px] px-6 pb-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            {/* Logo */}
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-[2rem] border-4 border-slate-900 bg-[#f6f2e9] p-2 shadow-[4px_4px_0px_0px_#1e293b]">
              <ClubMark club={club} size="lg" />
            </div>

            {/* Club Info */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-4xl tracking-tight text-slate-900 sm:text-6xl">
                  {club.name}
                </h1>
                {club.category && (
                    <span className="inline-flex items-center rounded-full border-2 border-slate-900 bg-highlighter px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-900 shadow-[2px_2px_0px_0px_#1e293b]">
                    {club.category}
                  </span>
                )}
              </div>
              {club.tagline ? (
                <p className="text-muted text-sm mt-1 max-w-2xl">{club.tagline}</p>
              ) : (
                club.description && (
                  <p className="text-muted/70 text-sm mt-1 max-w-2xl italic">
                    {club.description}
                  </p>
                )
              )}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {club._count.members} member
                  {club._count.members !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {upcomingCount} upcoming event
                  {upcomingCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════ Action Bar ══════ */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-3 mb-10 pb-6 border-b border-border-subtle">
          {/* Join / Leave Club Button — opens the membership application flow */}
          <ClubJoinFlowButton
            club={{
              id: club.id,
              name: club.name,
              logoUrl: club.logoUrl,
              tagline: club.tagline,
              customFormFields: club.customFormFields ?? null,
              whatsappGroupUrl: club.whatsappGroupUrl ?? null,
            }}
            isMember={isMember}
            isOpenForMembers={isOpenForMembers}
            hasPendingApplication={hasPendingApplication}
          />

          {/* Recruitment Status Pill */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1e293b] font-marker ${
              isOpenForMembers
                ? "bg-marker-green text-white"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full border border-slate-900 ${
                isOpenForMembers ? "bg-white" : "bg-slate-400"
              }`}
            />
            {isOpenForMembers ? "Open for Members" : "Closed"}
          </span>

          {/* Social Links */}
          {socials
            .filter((s) => (club as Record<string, unknown>)[s.key])
            .map((s) => (
              <a
                key={s.key}
                href={String((club as Record<string, unknown>)[s.key])}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-surface-container-low transition-colors border border-transparent hover:border-border-subtle"
              >
                <s.icon className="w-3.5 h-3.5" />
                {s.label}
              </a>
            ))}
        </div>
      </div>

      {/* ══════ Tab Navigation ══════ */}
      <div className="flex justify-center mb-10">
        <div className="bg-white border-2 border-slate-900 p-1.5 rounded-full flex items-center gap-1 shadow-[4px_4px_0px_0px_#1e293b]">
          {visibleTabs.map((tab) => {
            const active = activeTab === tab.key;
            const cls = `px-8 py-2.5 rounded-full font-marker text-sm transition-all uppercase tracking-wide ${
              active
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:text-slate-900"
            }`;
            return tab.jsTab ? (
              <Link
                key={tab.key}
                href={tab.href}
                data-tab={tab.key}
                className={`tab-btn ${cls}`}
              >
                {tab.label}
              </Link>
            ) : (
              <Link key={tab.key} href={tab.href} className={cls}>
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
