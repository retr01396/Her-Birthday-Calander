"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, UserCheck, Loader2, AlertCircle } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface JoinClubButtonProps {
  clubId: string;
  isJoined: boolean;
  size?: "sm" | "md" | "lg";
  /** Rendered as an inline block so cards can update member counts live. */
  onToggle?: (joined: boolean) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function JoinClubButton({
  clubId,
  isJoined: initialJoined,
  size = "md",
  onToggle,
}: JoinClubButtonProps) {
  const router = useRouter();
  const [isJoined, setIsJoined] = useState(initialJoined);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const sizeClasses = {
    sm: "px-3.5 py-2 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-sm gap-2",
  }[size];

  const handleToggle = () => {
    if (isPending) return;
    setError(null);

    // Optimistic update
    const next = !isJoined;
    setIsJoined(next);
    onToggle?.(next);

    startTransition(async () => {
      try {
        const { toggleClubMembership } = await import(
          "@/app/actions/clubActions"
        );
        await toggleClubMembership(clubId);
        router.refresh();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update membership.";
        // Non-authenticated users are sent to the student sign-in flow.
        if (message.startsWith("Unauthorized")) {
          router.push("/login");
          return;
        }
        // Rollback on failure
        setIsJoined(initialJoined);
        onToggle?.(initialJoined);
        setError(message);
      }
    });
  };

  return (
    <div className="inline-flex flex-col items-start">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        aria-pressed={isJoined}
        className={`flex items-center justify-center rounded-xl font-bold transition-all active:scale-[0.97] disabled:opacity-60 disabled:cursor-wait shadow-sm ${sizeClasses} ${
          isJoined
            ? "border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400"
            : "bg-primary text-white hover:bg-primary-container"
        }`}
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {isJoined ? "Leaving..." : "Joining..."}
          </>
        ) : isJoined ? (
          <>
            <UserCheck className="w-4 h-4 text-emerald-500" />
            Joined
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            Join Club
          </>
        )}
      </button>

      {error && (
        <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-red-600 max-w-[220px]">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </span>
      )}
    </div>
  );
}
