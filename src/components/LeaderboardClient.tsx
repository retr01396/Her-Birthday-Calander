"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Crown,
  Medal,
  Building2,
  Users,
  CalendarDays,
  Ticket,
  Award,
  TrendingUp,
} from "lucide-react";
import type { StudentRank, ClubRank } from "@/lib/leaderboard";

// ─── Props ───────────────────────────────────────────────────────────────────

interface LeaderboardClientProps {
  students: StudentRank[];
  clubs: ClubRank[];
}

type Tab = "students" | "clubs";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPoints(points: number): string {
  return points.toLocaleString("en-US");
}

function initial(name: string): string {
  return name.charAt(0).toUpperCase();
}

// Deterministic avatar hue from a name (avoids ugly random flash on SSR)
function avatarHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % 360;
  }
  return hash;
}

function StudentAvatar({ name, size }: { name: string; size: number }) {
  const hue = avatarHue(name);
  return (
    <div
      className="rounded-full overflow-hidden border-4 flex items-center justify-center font-bold text-white shrink-0"
      style={{
        width: size,
        height: size,
        borderColor: "white",
        background: `linear-gradient(135deg, hsl(${hue} 70% 45%), hsl(${
          (hue + 40) % 360
        } 70% 35%))`,
      }}
    >
      <span style={{ fontSize: size * 0.4 }}>{initial(name)}</span>
    </div>
  );
}

function ClubLogo({
  name,
  logoUrl,
  size,
  rounded = "rounded-xl",
}: {
  name: string;
  logoUrl: string | null;
  size: number;
  rounded?: string;
}) {
  const hue = avatarHue(name);
  const isUsableUrl = logoUrl ? /^(https?:)?\/\//i.test(logoUrl) : false;
  return (
    <div
      className={`${rounded} overflow-hidden border flex items-center justify-center shrink-0`}
      style={{
        width: size,
        height: size,
        borderColor: "#e2e8f0",
        background: `linear-gradient(135deg, hsl(${hue} 65% 95%), hsl(${
          (hue + 40) % 360
        } 65% 88%))`,
      }}
    >
      {isUsableUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl as string}
          alt={`${name} logo`}
          className="w-full h-full object-cover"
        />
      ) : (
        <Building2 size={size * 0.45} className="text-primary" />
      )}
    </div>
  );
}

// ─── Podium Card ─────────────────────────────────────────────────────────────

function StudentPodiumCard({ rank, student }: { rank: number; student: StudentRank }) {
  const isFirst = rank === 1;
  const rankStyle =
    rank === 1
      ? "w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-600 text-white border-4 border-canvas shadow-md gap-1"
      : rank === 2
      ? "w-10 h-10 bg-gradient-to-br from-slate-300 to-slate-400 text-slate-700 border border-slate-300 shadow-sm"
      : "w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-800 text-white border border-amber-700 shadow-sm";
  const rankIcon =
    rank === 1 ? <Trophy size={14} /> : <Medal size={12} />;
  return (
    <div
      className={`liquid-glass shadow-[0_18px_42px_rgba(17,24,39,.12)] flex flex-col items-center text-center relative transition-transform hover:-translate-y-1 ${
        isFirst
          ? "p-8 z-10"
          : "p-6"
      }`}
    >
      {isFirst && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-inverse-primary rounded-t-2xl" />
      )}
      {/* Rank badge — gold / silver / bronze */}
      <div
        className={`absolute -top-5 left-1/2 -translate-x-1/2 rounded-full flex items-center justify-center font-label-mono text-label-mono z-10 ${rankStyle}`}
      >
        {rankIcon}
        #{rank}
      </div>

      <div className={isFirst ? "w-24 h-24 mt-4 mb-4" : "w-20 h-20 mt-4 mb-4"}>
        <StudentAvatar name={student.name} size={isFirst ? 96 : 80} />
      </div>

      <h3
        className={`${
          isFirst ? "font-marker text-3xl" : "font-marker text-2xl"
        } text-slate-900 mb-1`}
      >
        {student.name}
      </h3>
      <p className="text-xs text-muted mb-3">
        {student.department || "Student"}{" "}
        {student.yearOfStudy ? `· Year ${student.yearOfStudy}` : ""}
      </p>

      <div
        className={`font-label-mono text-label-mono text-primary bg-primary/10 px-4 py-1.5 rounded-lg mb-5 ${
          isFirst ? "text-[16px] font-bold" : ""
        }`}
      >
        {formatPoints(student.points)} pts
      </div>

      <div className="flex flex-wrap justify-center gap-2 mt-auto">
        <span className="text-[10px] uppercase font-bold tracking-wider bg-surface-container px-2 py-1 rounded text-on-surface-variant flex items-center gap-1">
          <Ticket size={12} />
          {student.eventsAttended} event{student.eventsAttended !== 1 ? "s" : ""}
        </span>
        <span className="text-[10px] uppercase font-bold tracking-wider bg-surface-container px-2 py-1 rounded text-on-surface-variant flex items-center gap-1">
          <Users size={12} />
          {student.clubsJoined} club{student.clubsJoined !== 1 ? "s" : ""}
        </span>
        <span className="text-[10px] uppercase font-bold tracking-wider bg-primary/10 px-2 py-1 rounded text-primary">
          {student.badge}
        </span>
      </div>
    </div>
  );
}

function ClubPodiumCard({ rank, club }: { rank: number; club: ClubRank }) {
  const isFirst = rank === 1;
  const rankStyle =
    rank === 1
      ? "w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-600 text-white border-4 border-canvas shadow-md gap-1"
      : rank === 2
      ? "w-10 h-10 bg-gradient-to-br from-slate-300 to-slate-400 text-slate-700 border border-slate-300 shadow-sm"
      : "w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-800 text-white border border-amber-700 shadow-sm";
  const rankIcon =
    rank === 1 ? <Crown size={14} /> : <Medal size={12} />;
  return (
    <div
      className={`liquid-glass shadow-[0_18px_42px_rgba(17,24,39,.12)] flex flex-col items-center text-center relative transition-transform hover:-translate-y-1 ${
        isFirst
          ? "p-8 z-10"
          : "p-6"
      }`}
    >
      {isFirst && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-inverse-primary rounded-t-2xl" />
      )}
      <div
        className={`absolute -top-5 left-1/2 -translate-x-1/2 rounded-full flex items-center justify-center font-label-mono text-label-mono z-10 ${rankStyle}`}
      >
        {rankIcon}
        #{rank}
      </div>

      <div className={isFirst ? "w-24 h-24 mt-4 mb-4" : "w-20 h-20 mt-4 mb-4"}>
        <ClubLogo name={club.name} logoUrl={club.logoUrl} size={isFirst ? 96 : 80} />
      </div>

      <div className="space-y-1">
        <h3
          className={`${
            isFirst
              ? "font-marker text-3xl text-marker-blue"
              : "font-marker text-2xl"
          } text-slate-900`}
        >
          {club.name}
        </h3>
        <span className="inline-block bg-surface-container-low text-secondary font-label-mono text-label-mono px-2 py-1 rounded-md">
          {club.badge}
        </span>
      </div>

      <div
        className={`font-label-mono text-label-mono text-primary bg-primary/10 px-4 py-1.5 rounded-lg w-full mt-4 ${
          isFirst ? "text-[16px] font-bold" : ""
        }`}
      >
        {formatPoints(club.score)} pts
      </div>

      <div className="flex flex-wrap justify-center gap-2 mt-4">
        <span className="text-[10px] uppercase font-bold tracking-wider bg-surface-container px-2 py-1 rounded text-on-surface-variant flex items-center gap-1">
          <CalendarDays size={12} />
          {club.eventCount} event{club.eventCount !== 1 ? "s" : ""}
        </span>
        <span className="text-[10px] uppercase font-bold tracking-wider bg-surface-container px-2 py-1 rounded text-on-surface-variant flex items-center gap-1">
          <Users size={12} />
          {club.memberCount} member{club.memberCount !== 1 ? "s" : ""}
        </span>
        <span className="text-[10px] uppercase font-bold tracking-wider bg-surface-container px-2 py-1 rounded text-on-surface-variant flex items-center gap-1">
          <Ticket size={12} />
          {club.totalRegistrations} reg
        </span>
      </div>
    </div>
  );
}

// ─── Ranked Table ────────────────────────────────────────────────────────────

function StudentTable({ students, startRank }: { students: StudentRank[]; startRank: number }) {
  return (
    <section className="bg-white rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_#1e293b] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[720px]">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-900 text-slate-700 font-marker text-sm uppercase">
              <th className="px-6 py-4 font-bold w-20 text-center">Rank</th>
              <th className="px-6 py-4 font-bold">Student Name</th>
              <th className="px-6 py-4 font-bold hidden md:table-cell">
                Department
              </th>
              <th className="px-6 py-4 font-bold hidden sm:table-cell">
                Activity
              </th>
              <th className="px-6 py-4 font-bold text-right">
                Impact Points
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {students.map((student, i) => (
              <tr
                key={student.id}
                className="hover:bg-surface-container-lowest transition-colors group"
              >
                <td className="px-6 py-4 text-center">
                  <span className="font-label-mono text-label-mono text-secondary">
                    {String(startRank + i).padStart(2, "0")}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <StudentAvatar name={student.name} size={36} />
                    <div>
                      <span className="font-medium text-on-surface">
                        {student.name}
                      </span>
                      <p className="text-xs text-muted">

                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell text-muted text-sm">
                  {student.department || "—"}
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="bg-surface-container text-secondary font-label-mono text-label-mono px-2 py-1 rounded text-[10px]">
                      {student.eventsAttended} EVENTS
                    </span>
                    <span className="bg-surface-container text-secondary font-label-mono text-label-mono px-2 py-1 rounded text-[10px]">
                      {student.clubsJoined} CLUBS
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-label-mono text-label-mono font-bold text-on-surface">
                    {formatPoints(student.points)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ClubTable({ clubs, startRank }: { clubs: ClubRank[]; startRank: number }) {
  return (
    <section className="bg-white rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_#1e293b] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[720px]">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-900 text-slate-700 font-marker text-sm uppercase">
              <th className="px-6 py-4 font-bold w-20 text-center">Rank</th>
              <th className="px-6 py-4 font-bold">Club Name</th>
              <th className="px-6 py-4 font-bold hidden md:table-cell">
                Category
              </th>
              <th className="px-6 py-4 font-bold hidden lg:table-cell">
                Key Achievement
              </th>
              <th className="px-6 py-4 font-bold text-right">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {clubs.map((club, i) => (
              <tr
                key={club.id}
                className="hover:bg-surface-container-lowest transition-colors group"
              >
                <td className="px-6 py-4 text-center">
                  <span className="font-label-mono text-label-mono text-secondary">
                    {String(startRank + i).padStart(2, "0")}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={club.slug ? `/clubs/${club.slug}` : "#"}
                    className="flex items-center gap-3"
                  >
                    <ClubLogo
                      name={club.name}
                      logoUrl={club.logoUrl}
                      size={40}
                      rounded="rounded-lg"
                    />
                    <span className="font-medium text-on-surface group-hover:text-primary transition-colors">
                      {club.name}
                    </span>
                  </Link>
                </td>
                <td className="px-6 py-4 hidden md:table-cell text-muted text-sm">
                  <span className="bg-surface-container text-secondary font-label-mono text-label-mono px-2 py-1 rounded">
                    {club.category || "General"}
                  </span>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell text-secondary text-sm line-clamp-1">
                  {club.latestEvent
                    ? `Hosted "${club.latestEvent}"`
                    : "Getting started"}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-label-mono text-label-mono text-primary font-bold">
                    {formatPoints(club.score)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ─── How Points Work ────────────────────────────────────────────────────────

const POINTS_TABLE = [
  {
    emoji: "🎟️",
    label: "Event Attendance",
    pts: "+10",
    sub: "Verified via QR check-in",
  },
  { emoji: "🥇", label: "1st Place Winner", pts: "+50", sub: "At event finalization" },
  { emoji: "🥈", label: "2nd Place Winner", pts: "+30", sub: "At event finalization" },
  { emoji: "🥉", label: "3rd Place Winner", pts: "+20", sub: "At event finalization" },
];

function PointsReference() {
  return (
    <section className="mb-8 bg-white rounded-[15px_225px_15px_255px/255px_15px_225px_15px] border-2 border-slate-900 shadow-[4px_4px_0px_0px_#1e293b] p-6">
      <div className="flex items-center gap-2 mb-4">
        <Award size={20} className="text-marker-blue" />
        <h2 className="font-marker text-2xl text-slate-900">
          How Student Points Work
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {POINTS_TABLE.map((row) => (
          <div
            key={row.label}
            className="bg-surface-container-low rounded-xl p-3 flex items-center gap-3 border border-outline-variant/20"
          >
            <span className="text-2xl shrink-0">{row.emoji}</span>
            <div className="min-w-0">
              <p className="text-xs text-muted font-medium">{row.label}</p>
              <p className="font-label-mono text-label-mono font-bold text-primary">
                {row.pts} pts
              </p>
              <p className="text-[10px] text-muted">{row.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm py-20 text-center">
      <div className="flex justify-center mb-4 text-muted">{icon}</div>
      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">
        {title}
      </h3>
      <p className="text-muted text-body-md max-w-md mx-auto">{subtitle}</p>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function LeaderboardClient({ students, clubs }: LeaderboardClientProps) {
  const [tab, setTab] = useState<Tab>("students");

  const topStudents = students.slice(0, 3);
  const restStudents = students.slice(3);
  const topClubs = clubs.slice(0, 3);
  const restClubs = clubs.slice(3);

  return (
    <div className="animate-in">
      {/* ── Header + Dual-Tab Switcher ── */}
      <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border-2 border-slate-900 bg-highlighter px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[.12em] text-slate-900 shadow-[2px_2px_0px_0px_#1e293b]">
            <TrendingUp className="w-4 h-4" />
            Live Rankings
          </span>
          <h1 className="font-display text-6xl leading-[.88] tracking-tight text-slate-900 sm:text-8xl">
            CAMPUS<br /><em className="text-marker-blue">RANKINGS.</em>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600">
            Recognizing excellence across the campus ecosystem — computed live
            from real event registrations and club activity.
          </p>
        </div>

        <div className="inline-flex gap-3">
          <button
            onClick={() => setTab("students")}
            className={`px-6 py-2 rounded-[15px_225px_15px_255px/255px_15px_225px_15px] font-marker text-lg border-2 border-slate-900 shadow-[3px_3px_0px_0px_#1e293b] transition-transform flex items-center gap-2 ${
              tab === "students"
                ? "bg-marker-blue text-white"
                : "bg-white text-slate-700 hover:-translate-y-0.5"
            }`}
          >
            <Medal size={18} />
            Students
          </button>
          <button
            onClick={() => setTab("clubs")}
            className={`px-6 py-2 rounded-[15px_225px_15px_255px/255px_15px_225px_15px] font-marker text-lg border-2 border-slate-900 shadow-[3px_3px_0px_0px_#1e293b] transition-transform flex items-center gap-2 ${
              tab === "clubs"
                ? "bg-marker-blue text-white"
                : "bg-white text-slate-700 hover:-translate-y-0.5"
            }`}
          >
            <Building2 size={18} />
            Clubs
          </button>
        </div>
      </section>

      {/* ── Students Tab ── */}
      {tab === "students" && (
        <>
          <PointsReference />
          {students.length === 0 ? (
          <EmptyState
            icon={<Award size={48} />}
            title="No rankings yet"
            subtitle="Student rankings will appear here once users attend and finalize events. Points are awarded at finalization: +10 attendance, +50/30/20 for 1st/2nd/3rd place."
          />
        ) : (
          <div className="space-y-8">
            {/* Top 3 Podium */}
            {topStudents.length > 0 && (
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                {topStudents.length >= 2 && (
                  <div className="order-2 md:order-1 mt-8 md:mt-0">
                    <StudentPodiumCard rank={2} student={topStudents[1]} />
                  </div>
                )}
                {topStudents[0] && (
                  <div className="order-1 md:order-2 z-10">
                    <StudentPodiumCard rank={1} student={topStudents[0]} />
                  </div>
                )}
                {topStudents.length >= 3 && (
                  <div className="order-3 md:order-3 mt-8 md:mt-0">
                    <StudentPodiumCard rank={3} student={topStudents[2]} />
                  </div>
                )}
              </section>
            )}

            {/* Ranked Table (4+) */}
            {restStudents.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    Full Rankings
                  </h2>
                  <span className="text-xs text-muted">
                    Ranks {topStudents.length + 1}–{students.length}
                  </span>
                </div>
                <StudentTable students={restStudents} startRank={topStudents.length + 1} />
              </section>
            )}
          </div>
          )}
        </>
      )}

      {/* ── Clubs Tab ── */}
      {tab === "clubs" &&
        (clubs.length === 0 ? (
          <EmptyState
            icon={<Building2 size={48} />}
            title="No club rankings yet"
            subtitle="Club rankings will appear here once clubs are created and host events. Scores are computed live from events, registrations, and membership."
          />
        ) : (
          <div className="space-y-8">
            {/* Top 3 Podium */}
            {topClubs.length > 0 && (
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                {topClubs.length >= 2 && (
                  <div className="order-2 md:order-1 mt-8 md:mt-0">
                    <ClubPodiumCard rank={2} club={topClubs[1]} />
                  </div>
                )}
                {topClubs[0] && (
                  <div className="order-1 md:order-2 z-10">
                    <ClubPodiumCard rank={1} club={topClubs[0]} />
                  </div>
                )}
                {topClubs.length >= 3 && (
                  <div className="order-3 md:order-3 mt-8 md:mt-0">
                    <ClubPodiumCard rank={3} club={topClubs[2]} />
                  </div>
                )}
              </section>
            )}

            {/* Ranked Table (4+) */}
            {restClubs.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    Full Rankings
                  </h2>
                  <span className="text-xs text-muted">
                    Ranks {topClubs.length + 1}–{clubs.length}
                  </span>
                </div>
                <ClubTable clubs={restClubs} startRank={topClubs.length + 1} />
              </section>
            )}
          </div>
        ))}
    </div>
  );
}
