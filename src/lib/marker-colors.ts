export type MarkerColor = "blue" | "red" | "green" | "black"

export const markerText: Record<MarkerColor, string> = {
  blue: "text-marker-blue",
  red: "text-marker-red",
  green: "text-marker-green",
  black: "text-marker-slate",
}

export const markerBg: Record<MarkerColor, string> = {
  blue: "bg-marker-blue",
  red: "bg-marker-red",
  green: "bg-marker-green",
  black: "bg-marker-slate",
}

export const markerBorder: Record<MarkerColor, string> = {
  blue: "border-marker-blue",
  red: "border-marker-red",
  green: "border-marker-green",
  black: "border-marker-slate",
}

export const markerBgSoft: Record<MarkerColor, string> = {
  blue: "bg-blue-100",
  red: "bg-red-100",
  green: "bg-emerald-100",
  black: "bg-slate-200",
}

export const markerHex: Record<MarkerColor, string> = {
  blue: "#2563eb",
  red: "#ef4444",
  green: "#10b981",
  black: "#1e293b",
}
