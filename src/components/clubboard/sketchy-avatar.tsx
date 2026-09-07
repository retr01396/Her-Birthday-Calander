import { cn } from "@/lib/utils"
import { markerBg } from "@/lib/marker-colors"
import type { MarkerColor } from "@/lib/marker-colors"

interface SketchyAvatarProps {
  initials: string
  color: MarkerColor
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeMap = {
  sm: "h-8 w-8 text-xs border-[2px]",
  md: "h-11 w-11 text-sm border-[2px]",
  lg: "h-16 w-16 text-lg border-[3px]",
  xl: "h-24 w-24 text-2xl border-[3px]",
}

export function SketchyAvatar({ initials, color, size = "md", className }: SketchyAvatarProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border-slate-900 font-marker font-bold text-white shadow-[2px_2px_0px_0px_#1e293b]",
        sizeMap[size],
        markerBg[color],
        className,
      )}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}
