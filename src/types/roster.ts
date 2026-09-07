/**
 * Roster Studio — shared settings types used by both the club editor
 * (RosterClient) and the public roster renderer (PublicRoster).
 */

export type RosterLayout = "grid" | "list" | "cards";

export type FrameShape = "circle" | "rounded" | "hexagon" | "shield" | "octagon";

export interface RosterSettings {
  layout: RosterLayout;
  /** Photo frame shape applied to every member avatar. */
  frameShape: FrameShape;
  /** Frame border thickness in px (0 = no border). */
  frameBorderWidth: number;
  frameBorderColor: string;
  /** Soft drop shadow under the framed photo. */
  frameShadow: boolean;
  /** Roster section background. */
  bgColor: string;
  /** Card background / border for grid & cards layouts. */
  showCards: boolean;
  cardBorderColor: string;
  cardRadius: number;
  /** Gap between members in px. */
  gap: number;
  textAlign: "left" | "center" | "right";
  fontFamily: "sans" | "serif" | "mono";
  nameSize: "sm" | "md" | "lg" | "xl";
  nameWeight: number;
  nameColor: string;
  detailSize: "xs" | "sm" | "md";
  detailColor: string;
  /** Show the role/class badge under each name. */
  showBadges: boolean;
  badgeStyle: "filled" | "outline";
  hoverEffect: "none" | "scale" | "shadow";
}

export const DEFAULT_ROSTER_SETTINGS: RosterSettings = {
  layout: "cards",
  frameShape: "circle",
  frameBorderWidth: 2,
  frameBorderColor: "#6366f1",
  frameShadow: true,
  bgColor: "#ffffff",
  showCards: true,
  cardBorderColor: "#e2e8f0",
  cardRadius: 16,
  gap: 16,
  textAlign: "center",
  fontFamily: "sans",
  nameSize: "md",
  nameWeight: 700,
  nameColor: "#0f172a",
  detailSize: "sm",
  detailColor: "#64748b",
  showBadges: true,
  badgeStyle: "filled",
  hoverEffect: "shadow",
};

export const FRAME_SHAPE_LABELS: Record<FrameShape, string> = {
  circle: "Circle",
  rounded: "Rounded",
  hexagon: "Hexagon",
  shield: "Shield",
  octagon: "Octagon",
};

export const FONT_FAMILY_CLASS: Record<RosterSettings["fontFamily"], string> = {
  sans: "font-sans",
  serif: "font-serif",
  mono: "font-mono",
};

export const NAME_SIZE_CLASS: Record<RosterSettings["nameSize"], string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

export const DETAIL_SIZE_CLASS: Record<RosterSettings["detailSize"], string> = {
  xs: "text-[11px]",
  sm: "text-xs",
  md: "text-sm",
};

/** CSS clip-path for geometric photo frames (circle/rounded use radius). */
export const FRAME_CLIP_PATHS: Record<FrameShape, string | null> = {
  circle: null,
  rounded: null,
  hexagon:
    "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)",
  shield:
    "polygon(50% 0%, 100% 12%, 82% 82%, 50% 100%, 18% 82%, 0% 12%)",
  octagon:
    "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
};
