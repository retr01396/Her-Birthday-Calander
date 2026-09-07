/**
 * Resolve a club member's public display title.
 * Leaders default to "Club President"; members with a custom roleTitle
 * (anything other than the "Member" default) show that title; everyone
 * else shows "Member".
 */
export function displayTitle(m: {
  clubRole: string;
  roleTitle: string | null;
}): string {
  if (m.clubRole === "LEADER") return m.roleTitle || "Club President";
  if (m.roleTitle && m.roleTitle !== "Member") return m.roleTitle;
  return "Member";
}
