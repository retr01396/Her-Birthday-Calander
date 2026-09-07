"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import ClubJoiningFlow, { ClubJoiningField } from "./ClubJoiningFlow";
import JoinClubButton from "./JoinClubButton";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ClubJoinFlowButtonProps {
  club: {
    id: string;
    name: string;
    logoUrl?: string | null;
    tagline?: string | null;
    customFormFields?: ClubJoiningField[] | null;
    whatsappGroupUrl?: string | null;
  };
  isMember: boolean;
  isOpenForMembers: boolean;
  hasPendingApplication?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Join button for the public club profile. Logged-in students must complete
 * the club's membership application form (custom questions set by the leader)
 * before enrollment; on submit they get the club's WhatsApp group link.
 */
export default function ClubJoinFlowButton({
  club,
  isMember,
  isOpenForMembers,
  hasPendingApplication = false,
}: ClubJoinFlowButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(hasPendingApplication);

  if (isMember) {
    return <JoinClubButton clubId={club.id} isJoined />;
  }

  if (!isOpenForMembers) {
    return (
      <button
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-surface-container-low text-muted cursor-not-allowed"
        disabled
      >
        <UserPlus className="w-4 h-4" />
        Recruitment Closed
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={isApplying}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-[0.97] shadow-sm disabled:opacity-60 ${
          applied
            ? "border border-emerald-300 bg-emerald-50 text-emerald-700"
            : "bg-primary text-white hover:bg-primary-container"
        }`}
      >
        {isApplying ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Applying...
          </>
        ) : applied ? (
          <>
            <UserCheck className="w-4 h-4 text-emerald-500" />
            Applied
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            Join Club
          </>
        )}
      </button>

      <ClubJoiningFlow
        club={club}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmitApplication={async (answers) => {
          setIsApplying(true);
          try {
            const { applyToClub } = await import("@/app/actions/clubActions");
            const result = await applyToClub(club.id, answers as Record<string, string>);
            return { whatsappGroupUrl: result.whatsappGroupUrl };
          } finally {
            setIsApplying(false);
          }
        }}
        onSuccess={() => {
          setApplied(true);
          setIsOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}
