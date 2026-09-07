"use client";

import type { CSSProperties } from "react";
import {
  DEFAULT_ROSTER_SETTINGS,
  DETAIL_SIZE_CLASS,
  FONT_FAMILY_CLASS,
  NAME_SIZE_CLASS,
  RosterSettings,
} from "@/types/roster";
import { displayTitle } from "@/lib/roles";
import FramedAvatar from "./FramedAvatar";

export interface RosterMemberData {
  id: string;
  clubRole: string;
  avatarUrl?: string | null;
  displayName?: string | null;
  className?: string | null;
  roleTitle?: string | null;
  isExecutive: boolean;
  badgeColor?: string | null;
  displayOrder?: number | null;
  /** Null for free-form entries added by the club (no student account). */
  user?: {
    name: string;
    department?: string | null;
    yearOfStudy?: string | null;
  } | null;
}

interface PublicRosterProps {
  members: RosterMemberData[];
  settings?: Partial<RosterSettings> | null;
}

/** Resolve a member's badge text (role title). */
function memberTitle(m: RosterMemberData): string {
  return displayTitle({
    clubRole: m.clubRole,
    roleTitle: m.roleTitle ?? null,
  });
}

/** Badge color: per-member override, else executive amber, else neutral. */
function memberBadgeColor(m: RosterMemberData, settings: RosterSettings): string {
  if (m.badgeColor) return m.badgeColor;
  if (m.isExecutive || m.clubRole === "LEADER") return "#d97706";
  return settings.badgeStyle === "filled" ? "#475569" : "#94a3b8";
}

function MemberCell({
  m,
  s,
  layout,
}: {
  m: RosterMemberData;
  s: RosterSettings;
  layout: "grid" | "list" | "cards";
}) {
  const name = m.displayName || m.user?.name || "Member";
  const detail = [m.className, m.user?.department, m.user?.yearOfStudy]
    .filter(Boolean)
    .join(" · ");
  const title = memberTitle(m);
  const badgeColor = memberBadgeColor(m, s);

  const hoverClass =
    s.hoverEffect === "scale"
      ? "hover:scale-[1.03]"
      : s.hoverEffect === "shadow"
      ? "hover:shadow-lg"
      : "";

  const isCard = s.showCards && layout !== "list";
  const containerStyle: CSSProperties = {
    backgroundColor: isCard ? "#ffffff" : "transparent",
    border: isCard ? `1px solid ${s.cardBorderColor}` : undefined,
    borderRadius: isCard ? s.cardRadius : undefined,
    padding: isCard ? 20 : 8,
    textAlign: s.textAlign,
    display: "flex",
    flexDirection: layout === "list" ? "row" : "column",
    alignItems: "center",
    gap: layout === "list" ? 16 : 10,
    justifyContent: layout === "list" ? "flex-start" : "center",
    flex: 1,
    minWidth: 0,
  };

  return (
    <div
      className={`transition-all duration-200 ${hoverClass}`}
      style={containerStyle}
    >
      <FramedAvatar
        src={m.avatarUrl}
        name={name}
        shape={s.frameShape}
        borderColor={s.frameBorderColor}
        borderWidth={s.frameBorderWidth}
        shadow={s.frameShadow}
        size={layout === "list" ? 64 : 84}
      />
      <div className="min-w-0" style={{ textAlign: s.textAlign }}>
        <p
          className={`${NAME_SIZE_CLASS[s.nameSize]} ${FONT_FAMILY_CLASS[s.fontFamily]} truncate`}
          style={{ fontWeight: s.nameWeight, color: s.nameColor, lineHeight: 1.25 }}
        >
          {name}
        </p>
        {detail && (
          <p
            className={`${DETAIL_SIZE_CLASS[s.detailSize]} ${FONT_FAMILY_CLASS[s.fontFamily]} truncate mt-0.5`}
            style={{ color: s.detailColor }}
          >
            {detail}
          </p>
        )}
        {s.showBadges && (
          <span
            className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              s.badgeStyle === "outline"
                ? "border"
                : "text-white"
            }`}
            style={{
              backgroundColor: s.badgeStyle === "filled" ? badgeColor : "transparent",
              color: s.badgeStyle === "outline" ? badgeColor : "#ffffff",
              borderColor: badgeColor,
            }}
          >
            {title}
          </span>
        )}
      </div>
    </div>
  );
}

export default function PublicRoster({
  members,
  settings: rawSettings,
}: PublicRosterProps) {
  const s: RosterSettings = { ...DEFAULT_ROSTER_SETTINGS, ...(rawSettings ?? {}) };
  const sorted = [...members].sort(
    (a, b) =>
      (a.displayOrder ?? 0) - (b.displayOrder ?? 0) ||
      (a.displayName || a.user?.name || "").localeCompare(
        b.displayName || b.user?.name || ""
      )
  );

  const gapStyle = { gap: s.gap };
  const fontClass = FONT_FAMILY_CLASS[s.fontFamily];

  return (
    <div
      className="rounded-2xl p-6 sm:p-8"
      style={{ backgroundColor: s.bgColor }}
    >
      {sorted.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">
          This club has no members yet.
        </p>
      ) : s.layout === "list" ? (
        <div className="flex flex-col" style={gapStyle}>
          {sorted.map((m) => (
            <MemberCell key={m.id} m={m} s={s} layout="list" />
          ))}
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${fontClass}`}
          style={gapStyle}
        >
          {sorted.map((m) => (
            <MemberCell key={m.id} m={m} s={s} layout={s.layout} />
          ))}
        </div>
      )}
    </div>
  );
}
