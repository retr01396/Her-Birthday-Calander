import { getCurrentUser } from "@/lib/session";
import { displayTitle } from "@/lib/roles";
import { getClubBySlug } from "@/app/actions/unifiedActions";
import { getMyPendingMembershipClubIds } from "@/app/actions/clubActions";
import { notFound } from "next/navigation";
import Script from "next/script";
import { Navbar } from "@/components/Navbar";
import ClubProfileHeader, {
  type ClubHeaderData,
} from "@/components/clubs/ClubProfileHeader";
import PublicRoster from "@/components/clubs/PublicRoster";
import {
  Users,
  Crown,
  Building2,
  Globe,
  Github,
  Instagram,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { getPresentationClubBySlug, getPresentationProfessionalBodyBySlug } from "@/lib/presentation-fixtures";
import { ClubMark } from "@/components/clubboard/club-identity";
import { GlassCard, ScrollReveal, ScrollParallax } from "@/components/motion-primitives";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Compute a live status badge for an event based on the current time.
 * Used to derive the "upcoming events" count in the header.
 */
function getEventStatus(event: {
  startTime: Date | string;
  endTime: Date | string | null;
}) {
  const now = new Date();
  const start = new Date(event.startTime);
  const end = event.endTime
    ? new Date(event.endTime)
    : new Date(start.getTime() + 1000 * 60 * 60 * 2);

  if (now < start) return "UPCOMING";
  if (now >= start && now <= end) return "LIVE NOW";
  return "ENDED";
}

export default async function ClubPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { slug } = await params;
  const { from } = await searchParams;
  const isOnboardingPreview = from === "onboarding";
  const user = await getCurrentUser();
  const databaseClub = await getClubBySlug(slug);
  const professionalBody = !databaseClub ? getPresentationProfessionalBodyBySlug(slug) : null;
  if (professionalBody) {
    return (
      <div className="campus-paper min-h-screen">
        {!isOnboardingPreview && <Navbar userRole={user ? (user.role as any) : null} userName={user?.name ?? undefined} />}
        <main className="mx-auto max-w-5xl px-5 pb-24 pt-36 sm:px-8">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[.24em] text-marker-blue">Professional body · official source profile</p>
          <div className="mt-8 liquid-glass p-8 sm:p-14">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
              <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-3xl border border-slate-900/10 bg-white/70 p-5">
                {professionalBody.logoUrl ? <img src={professionalBody.logoUrl} alt={`${professionalBody.name} official logo`} className="max-h-full max-w-full object-contain" /> : <span className="font-ui text-sm font-bold text-slate-500">Official asset pending</span>}
              </div>
              <div><h1 className="font-display text-6xl leading-none text-slate-900 sm:text-8xl">{professionalBody.name}</h1><p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">{professionalBody.description}</p></div>
            </div>
            <div className="mt-10 border-t border-slate-900/10 pt-6"><p className="font-mono text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">Factual information source</p><a href={professionalBody.officialSource} target="_blank" rel="noreferrer" className="mt-2 inline-block font-ui text-sm font-bold text-marker-blue hover:underline">Visit official organization website ↗</a></div>
          </div>
        </main>
      </div>
    )
  }
  const club = databaseClub ?? getPresentationClubBySlug(slug);

  if (!club) {
    notFound();
  }

  // Draft / suspended clubs are not public. Only the club's own account or a
  // site admin may preview them directly.
  const canViewUnpublished =
    user?.role === "SUPER_ADMIN" ||
    (user?.role === "CLUB" && user.clubId === club.id);
  if (club.status !== "PUBLISHED" && !canViewUnpublished) {
    notFound();
  }

  // ── Team composition ──
  const executives = club.members.filter(
    (m) => m.isExecutive || (m.roleTitle && m.roleTitle !== "Member")
  );

  const upcomingCount = club.events.filter((e) => getEventStatus(e) !== "ENDED")
    .length;

  const isOpenForMembers =
    (club as any).recruitmentStatus === "OPEN_FOR_MEMBERS";
  const isMember = user
    ? club.members.some((m) => m.userId === user.id)
    : false;
  const pendingMembership = user
    ? await getMyPendingMembershipClubIds()
    : new Set<string>();
  const hasPendingApplication = pendingMembership.has(club.id);

  const headerClub: ClubHeaderData = {
    ...club,
    coverUrl: club.coverUrl,
    category: club.category,
    customFormFields: (club as any).customFormFields ?? null,
    members: club.members.map((m) => ({ userId: m.userId })),
  };

  return (
    <div className="campus-paper min-h-screen relative">
      {/* During onboarding, keep the student inside the flow — no app nav */}
      {!isOnboardingPreview && (
        <Navbar
          userRole={user ? (user.role as any) : null}
          userName={user?.name ?? undefined}
        />
      )}

      <ClubProfileHeader
        club={headerClub}
        isMember={isMember}
        isOpenForMembers={isOpenForMembers}
        hasPendingApplication={hasPendingApplication}
        upcomingCount={upcomingCount}
        activeTab="about"
        isOnboardingPreview={isOnboardingPreview}
      />

      <main className="mx-auto mb-20 mt-6 max-w-[1200px] px-4 sm:px-6">
        {/* ══════ Tab: About ══════ */}
        <div className="tab-content animate-in active" id="tab-about">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left — About + Executive Board */}
            <div className="lg:col-span-2 space-y-8">
              {/* About / Mission */}
              <ScrollReveal>
              <GlassCard className="min-h-[230px]">
                <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[.2em] text-marker-blue">01 · About</p>
                <h3 className="mb-4 font-display text-4xl tracking-tight text-slate-900">
                  About Us
                </h3>
                <div className="text-slate-600 font-medium leading-relaxed whitespace-pre-line text-sm">
                  {(club as any).about || club.description || (
                    <span className="italic text-muted/50">
                      No description provided.
                    </span>
                  )}
                </div>
              </GlassCard>
              </ScrollReveal>

              {/* Executive Board */}
              {executives.length > 0 && (
                <ScrollReveal delay={0.1}>
                <GlassCard>
                  <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[.2em] text-marker-red">02 · People</p>
                  <h3 className="mb-1 flex items-center gap-2 font-display text-3xl text-slate-900">
                    <Crown className="w-6 h-6 text-marker-red" />
                    Leadership &amp; Core Team
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mb-6">
                    The executives steering {club.name}.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {executives.map((m) => (
                      <div
                        key={m.id}
                        className="liquid-glass flex items-center gap-3 p-4 transition-all hover:border-amber-300/60"
                      >
                        <div className="w-11 h-11 rounded-full bg-amber-100 border-2 border-amber-200 flex items-center justify-center shrink-0 overflow-hidden">
                          {m.avatarUrl ? (
                            <img
                              src={m.avatarUrl}
                              alt={m.displayName || m.user?.name || "Member"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-amber-700 font-bold text-sm">
                              {(m.displayName || m.user?.name || "M")
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm text-on-surface truncate">
                            {m.displayName || m.user?.name || "Member"}
                          </p>
                          <span className="text-[10px] font-bold uppercase text-amber-600 tracking-wider">
                            {displayTitle(m)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
                </ScrollReveal>
              )}
            </div>

            {/* Right — Stats + Social */}
            <div className="space-y-6">
              <ScrollParallax distance={35}>
              <GlassCard className="mb-6">
                <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[.2em] text-marker-green">03 · Signal</p>
                <h4 className="mb-4 font-display text-3xl text-slate-900">Community signal</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium">Total Members</span>
                    <span className="font-marker text-lg text-slate-900">
                      {club._count.members}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium">Total Events</span>
                    <span className="font-marker text-lg text-slate-900">
                      {club._count.events}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium">Executive Board</span>
                    <span className="font-marker text-lg text-slate-900">
                      {executives.length}
                    </span>
                  </div>
                </div>
              </GlassCard>
              </ScrollParallax>

              {(club as any).website ||
              (club as any).github ||
              (club as any).instagram ||
              (club as any).discord ? (
                <GlassCard>
                  <h4 className="mb-4 font-display text-3xl text-slate-900">
                    Connect
                  </h4>
                  <div className="space-y-1">
                    {(club as any).website && (
                      <a
                        href={(club as any).website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <Globe className="w-4 h-4 text-secondary group-hover:text-primary" />
                          <span className="text-sm font-medium">Website</span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-muted" />
                      </a>
                    )}
                    {(club as any).github && (
                      <a
                        href={(club as any).github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <Github className="w-4 h-4 text-secondary group-hover:text-primary" />
                          <span className="text-sm font-medium">GitHub</span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-muted" />
                      </a>
                    )}
                    {(club as any).instagram && (
                      <a
                        href={(club as any).instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <Instagram className="w-4 h-4 text-secondary group-hover:text-primary" />
                          <span className="text-sm font-medium">Instagram</span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-muted" />
                      </a>
                    )}
                    {(club as any).discord && (
                      <a
                        href={(club as any).discord}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <MessageCircle className="w-4 h-4 text-secondary group-hover:text-primary" />
                          <span className="text-sm font-medium">Discord</span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-muted" />
                      </a>
                    )}
                  </div>
                </GlassCard>
              ) : null}
            </div>
          </div>
        </div>

        {/* ══════ Tab: Members List ══════ */}
        <div className="tab-content animate-in" id="tab-members">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-marker text-slate-900 flex items-center gap-2">
                <Users className="w-6 h-6 text-marker-blue" strokeWidth={2.5} />
                Members
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {club._count.members} student
                {club._count.members !== 1 ? "s" : ""} in {club.name}
              </p>
            </div>
          </div>

          {club.members.length === 0 ? (
            <div className="text-center py-20 bg-surface rounded-2xl border border-border-subtle">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h4 className="text-lg font-bold text-on-surface mb-1">
                No Members Yet
              </h4>
              <p className="text-muted text-sm">
                This club has no members yet.
              </p>
            </div>
          ) : (
            <PublicRoster
              members={club.members as any}
              settings={(club as any).rosterSettings ?? null}
            />
          )}
        </div>
      </main>

      {/* ── Tab Switching Script (About / Members; Events & Feed are pages) ── */}
      <Script
        id="tab-switcher"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function () {
              function activate(id) {
                document.querySelectorAll('.tab-btn').forEach(function (b) {
                  b.classList.remove('active-tab');
                  b.classList.add('text-secondary');
                });
                document.querySelectorAll('.tab-content').forEach(function (c) {
                  c.classList.remove('active');
                });
                var btn = document.querySelector('.tab-btn[data-tab="' + id + '"]');
                if (btn) { btn.classList.add('active-tab'); btn.classList.remove('text-secondary'); }
                var content = document.getElementById('tab-' + id);
                if (content) {
                  content.classList.add('active');
                  content.style.animation = 'none';
                  void content.offsetHeight;
                  content.style.animation = null;
                }
              }
              document.querySelectorAll('.tab-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                  activate(this.getAttribute('data-tab'));
                });
              });
              activate((window.location.hash || '').replace('#', '') === 'members' ? 'members' : 'about');
            })();
          `,
        }}
      />
    </div>
  );
}
