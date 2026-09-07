"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Building2,
  Users,
  ExternalLink,
  CheckCircle2,
  Copy,
  ShieldAlert,
  ArrowRight,
  Ticket,
  Clock,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import {
  registerForIndividualEvent,
  claimExternalPass,
} from "@/app/actions/eventActions";
import {
  createTeam,
  joinTeamByCode,
  submitTeamPassUrl,
} from "@/app/actions/teamActions";
import FeedbackModal from "@/components/FeedbackModal";
import { DigitalPassModal } from "@/components/pass/DigitalPassModal";
import { Navbar } from "@/components/Navbar";

interface EventPageClientProps {
  event: {
    id: string;
    title: string;
    description?: string | null;
    imageUrl?: string | null;
    location?: string | null;
    startDate: Date;
    endDate: Date;
    eventType: "INTERNAL" | "EXTERNAL";
    externalFormUrl?: string | null;
    teamType: "INDIVIDUAL" | "TEAM";
    minTeamSize: number;
    maxTeamSize: number;
    passStrategy?: "CAPTAIN_ONLY" | "INDIVIDUAL" | null;
    club: {
      id: string;
      name: string;
      slug: string;
      logoUrl?: string | null;
    };
    registrationCount: number;
    applicationCount: number | null;
    capacity: number;
    registrationOpen: boolean;
    showCapacityLimit: boolean;
    requiresApproval: boolean;
    isClosed: boolean;
    hasForm?: boolean;
  };
  user: any | null;
  initialRegistration: any | null;
  initialTeam: any | null;
}

export default function EventPageClient({
  event,
  user,
  initialRegistration,
  initialTeam,
}: EventPageClientProps) {
  const router = useRouter();

  const [registration, setRegistration] = useState(initialRegistration);
  const [team, setTeam] = useState(initialTeam);

  const [teamMode, setTeamMode] = useState<"create" | "join">("create");
  const [teamName, setTeamName] = useState("");
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [passUrlInput, setPassUrlInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<{ title: string; message: string } | null>(null);
  const [showPass, setShowPass] = useState(false);

  // A registration only counts as a live pass once the club has approved it
  // (shortlist events) or the student registered directly.
  const isRegistered =
    registration?.status === "REGISTERED" ||
    registration?.status === "ATTENDED";
  const isPendingApplication =
    !!registration && registration.status === "PENDING";
  const isRejectedApplication =
    !!registration && registration.status === "REJECTED";
  const isExternal = event.eventType === "EXTERNAL";
  const isTeam = event.teamType === "TEAM";

  const capacity = event.capacity > 0 ? event.capacity : null;
  const isFull =
    capacity !== null && event.registrationCount >= capacity;
  const showCapacity = event.showCapacityLimit && capacity !== null;
  const capacityPct = showCapacity
    ? Math.min((event.registrationCount / capacity) * 100, 100)
    : 0;
  const capacityBarColor = isFull
    ? "bg-red-500"
    : capacity !== null && event.registrationCount > capacity * 0.8
    ? "bg-amber-500"
    : "bg-emerald-500";

  const handleIndividualRegister = async () => {
    if (!user) {
      router.push(`/login?callbackUrl=/events/${event.id}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await registerForIndividualEvent(event.id);
      setRegistration(res.registration);
      setShowPass(true);
      setFeedback({
        title: "Registration Confirmed!",
        message: `You are officially registered for ${event.title}. Your QR pass is ready to scan at the venue.`,
      });
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?callbackUrl=/events/${event.id}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await createTeam(event.id, teamName);

      setTeam({
        id: res.team.id,
        teamName: res.team.name,
        joinCode: res.joinCode,
        leaderId: res.team.leaderId,
        leader: { id: user.id, name: user.name },
        members: [{ user: { id: user.id, name: user.name } }],
      });

      setFeedback({
        title: "Team Created Successfully!",
        message: `Your team "${res.team.name}" has been created with join code ${res.joinCode}. Share this code with your teammates!`,
      });
    } catch (err: any) {
      setError(err.message || "Failed to create team.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?callbackUrl=/events/${event.id}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await joinTeamByCode(inviteCodeInput);

      setTeam({
        id: res.team.id,
        teamName: res.teamName,
        joinCode: res.team.joinCode,
        leaderId: res.team.leaderId,
        leader: { name: res.leaderName },
        members: res.team.members,
      });

      setFeedback({
        title: "Joined Team Successfully!",
        message: `You have joined "${res.teamName}" led by ${res.leaderName}. The event ticket is now available on your dashboard!`,
      });
    } catch (err: any) {
      setError(err.message || "Failed to join team.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTeamPass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !team) return;

    setLoading(true);
    setError(null);

    try {
      await submitTeamPassUrl(team.id, passUrlInput);

      if (event.passStrategy === "CAPTAIN_ONLY") {
        setTeam({ ...team, externalPassUrl: passUrlInput });
      } else {
        const updatedMembers = team.members.map((m: any) =>
          m.user?.id === user.id ? { ...m, externalPassUrl: passUrlInput } : m
        );
        setTeam({ ...team, members: updatedMembers });
      }

      setFeedback({
        title: "Pass Submitted Successfully!",
        message: `Your external pass has been securely linked to your team registration.`,
      });
      setPassUrlInput("");
    } catch (err: any) {
      setError(err.message || "Failed to submit pass.");
    } finally {
      setLoading(false);
    }
  };

  const handleClaimExternalPass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?callbackUrl=/events/${event.id}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await claimExternalPass({
        eventId: event.id,
        passUrl: passUrlInput,
      });

      setRegistration(res.registration);
      setFeedback({
        title: "Pass Claimed Successfully!",
        message: `Your external pass has been securely linked to your AntiGravity account.`,
      });
    } catch (err: any) {
      setError(err.message || "Failed to claim external pass.");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startDate = new Date(event.startDate);

  return (
    <div className="min-h-screen relative">
      <Navbar
        userRole={user ? (user.role as any) : null}
        userName={user?.name}
        userEmail={user?.email}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-marker text-sm text-slate-500 hover:text-marker-blue transition-colors bg-white px-4 py-2 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1e293b] rounded-full"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Hero Card */}
        <div className="relative bg-white border-2 border-slate-900 rounded-[15px_225px_15px_255px/255px_15px_225px_15px] shadow-[4px_4px_0px_0px_#1e293b] overflow-hidden mt-6">
          <div className="relative z-10 p-6 sm:p-10">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
              <div className="space-y-4 max-w-2xl">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 font-marker">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-marker-red text-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1e293b]">
                    {event.eventType} EVENT
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-marker-blue text-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1e293b]">
                    {event.teamType}{" "}
                    {event.teamType === "TEAM"
                      ? `(${event.minTeamSize}-${event.maxTeamSize} members)`
                      : "Single Pass"}
                  </span>
                  <Link
                    href={`/clubs/${event.club.slug}`}
                    className="px-3 py-1 rounded-full text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 transition flex items-center gap-1.5 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1e293b]"
                  >
                    <Building2 className="w-3.5 h-3.5 text-marker-blue" />
                    <span>{event.club.name}</span>
                  </Link>
                </div>

                <h1 className="text-4xl sm:text-5xl font-marker text-slate-900 tracking-tight">
                  {event.title}
                </h1>

                <p className="text-slate-600 font-medium text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {event.description ||
                    "Join us for an exciting campus event featuring engaging sessions, activities, and opportunities to connect!"}
                </p>

                {/* Date / Venue */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1e293b]">
                    <Calendar className="w-5 h-5 text-marker-blue flex-shrink-0" />
                    <div className="text-xs">
                      <div className="text-slate-500 font-medium">Date & Time</div>
                      <div className="font-marker text-slate-900 text-sm">
                        {startDate.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1e293b]">
                    <MapPin className="w-5 h-5 text-marker-blue flex-shrink-0" />
                    <div className="text-xs">
                      <div className="text-slate-500 font-medium">Venue / Location</div>
                      <div className="font-marker text-slate-900 text-sm truncate">
                        {event.location || "Campus Main Auditorium"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action / Registration Card */}
              <div className="w-full md:w-80 bg-white border-2 border-slate-900 rounded-[15px_225px_15px_255px/255px_15px_225px_15px] p-6 shadow-[4px_4px_0px_0px_#1e293b] space-y-5 flex-shrink-0">
                <div className="border-b-2 border-slate-900/10 pb-3 flex items-center justify-between font-marker">
                  <span className="text-sm uppercase text-slate-500 tracking-wider">
                    Registration
                  </span>
                  <span className="text-sm text-marker-blue">
                    {event.requiresApproval
                      ? `${event.applicationCount ?? 0} Applied`
                      : `${event.registrationCount} Registered`}
                  </span>
                </div>

                {/* Live capacity bar (club can hide via showCapacityLimit). For
                    shortlist events the bar tracks SELECTED applicants, and a
                    separate line shows how many applications arrived. */}
                {showCapacity && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-muted">
                        {event.requiresApproval ? "Selected" : "Capacity"}
                      </span>
                      <span
                        className={`font-semibold ${
                          isFull ? "text-red-600" : "text-on-surface"
                        }`}
                      >
                        {event.registrationCount}/{capacity}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${capacityBarColor}`}
                        style={{ width: `${capacityPct}%` }}
                      />
                    </div>
                    {event.requiresApproval &&
                      event.applicationCount != null && (
                        <p className="text-[11px] text-muted mt-1.5">
                          {event.applicationCount} application
                          {event.applicationCount !== 1 ? "s" : ""} received
                        </p>
                      )}
                    {isFull && (
                      <p className="text-[11px] font-bold text-red-600 mt-1.5 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        {event.requiresApproval
                          ? "All seats selected — no more students can be approved"
                          : "Event Full — registrations closed"}
                      </p>
                    )}
                  </div>
                )}

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
                    {error}
                  </div>
                )}

                {/* Already-registered students always see their pass, even if
                    the event is now full or paused. */}
                {isRegistered ? (
                  /* 2. ALREADY REGISTERED STATE */
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                      <div className="text-sm font-bold text-on-surface">
                        You Are Registered!
                      </div>
                      <div className="text-xs text-emerald-700">
                        Your QR pass is ready — show it at the venue entrance.
                      </div>
                    </div>

                    {isTeam && team && (
                      <div className="p-4 bg-surface-container-low border border-border-subtle rounded-2xl space-y-3">
                        <div className="text-xs font-semibold text-primary uppercase tracking-wider">
                          Your Team
                        </div>
                        <div className="text-sm font-bold text-on-surface">
                          {team.teamName}
                        </div>
                        {team.leader?.name && (
                          <div className="text-xs text-muted">
                            Team Leader:{" "}
                            <span className="text-on-surface font-medium">
                              {team.leader.name}
                            </span>
                          </div>
                        )}

                        {team.joinCode && (
                          <div className="pt-2 border-t border-border-subtle">
                            <div className="text-[11px] text-muted mb-1">
                              Teammate Join Code:
                            </div>
                            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-border-subtle">
                              <code className="font-mono text-sm font-bold text-primary">
                                {team.joinCode}
                              </code>
                              <button
                                type="button"
                                onClick={() => copyCode(team.joinCode)}
                                className="text-muted hover:text-primary text-xs flex items-center gap-1"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>{copied ? "Copied!" : "Copy"}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {isTeam && !team && (
                      <div className="p-4 bg-surface-container-low border border-border-subtle rounded-2xl space-y-4">
                        <div className="text-xs font-semibold text-primary uppercase tracking-wider text-center">
                          Team Formation Required
                        </div>
                        <div className="flex bg-white p-1 rounded-xl border border-border-subtle">
                          <button
                            type="button"
                            onClick={() => {
                              setTeamMode("create");
                              setError(null);
                            }}
                            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                              teamMode === "create"
                                ? "bg-primary text-white shadow-sm"
                                : "text-muted hover:text-on-surface"
                            }`}
                          >
                            Create Team
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setTeamMode("join");
                              setError(null);
                            }}
                            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                              teamMode === "join"
                                ? "bg-primary text-white shadow-sm"
                                : "text-muted hover:text-on-surface"
                            }`}
                          >
                            Join with Code
                          </button>
                        </div>

                        {teamMode === "create" ? (
                          <form onSubmit={handleCreateTeam} className="space-y-3">
                            <div>
                              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
                                Team Name *
                              </label>
                              <input
                                type="text"
                                required
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                placeholder="e.g. CyberKnights"
                                className="w-full px-3 py-2 bg-white border border-border-subtle rounded-xl text-on-surface text-xs placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={loading || !teamName.trim()}
                              className="w-full py-3 px-4 bg-primary hover:bg-primary-container text-white font-semibold rounded-xl text-xs transition duration-150 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                            >
                              {loading ? "Creating..." : "Create Team & Get Code"}
                            </button>
                          </form>
                        ) : (
                          <form onSubmit={handleJoinTeam} className="space-y-3">
                            <div>
                              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
                                Team Join Code *
                              </label>
                              <input
                                type="text"
                                required
                                value={inviteCodeInput}
                                onChange={(e) =>
                                  setInviteCodeInput(e.target.value.toUpperCase())
                                }
                                placeholder="e.g. K9X2PL"
                                className="w-full px-3 py-2 bg-white border border-border-subtle rounded-xl text-on-surface text-xs font-mono placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={loading || !inviteCodeInput.trim()}
                              className="w-full py-3 px-4 bg-primary hover:bg-primary-container text-white font-semibold rounded-xl text-xs transition duration-150 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                            >
                              {loading ? "Joining..." : "Join Team"}
                            </button>
                          </form>
                        )}
                      </div>
                    )}

                    {isExternal ? (
                      (() => {
                        let passUrl = null;
                        if (!isTeam) {
                           passUrl = registration?.formResponses ? (registration.formResponses as any).passUrl : null;
                        } else {
                           if (event.passStrategy === "CAPTAIN_ONLY") {
                             passUrl = team?.externalPassUrl;
                           } else {
                             const member = team?.members?.find((m: any) => m.user?.id === user.id);
                             passUrl = member?.externalPassUrl;
                           }
                        }

                        if (passUrl) {
                          return (
                            <a
                              href={passUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-xs text-center block transition flex items-center justify-center gap-2"
                            >
                              <Ticket className="w-3.5 h-3.5" />
                              View Team Pass
                            </a>
                          );
                        } else {
                          // Pass not submitted yet
                          if (isTeam && event.passStrategy === "CAPTAIN_ONLY") {
                            const isCaptain = team?.leaderId === user?.id;
                            if (isCaptain) {
                              return (
                                <form onSubmit={handleSubmitTeamPass} className="space-y-3 pt-2">
                                  <div>
                                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
                                      Submit Team Pass URL *
                                    </label>
                                    <input
                                      type="text"
                                      required
                                      value={passUrlInput}
                                      onChange={(e) => setPassUrlInput(e.target.value)}
                                      placeholder="e.g. https://makemypass.com/t/..."
                                      className="w-full px-3 py-2 bg-white border border-border-subtle rounded-xl text-on-surface text-xs placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                  </div>
                                  <button
                                    type="submit"
                                    disabled={loading || !passUrlInput.trim()}
                                    className="w-full py-2.5 px-4 bg-primary hover:bg-primary-container text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
                                  >
                                    {loading ? "Submitting..." : "Save Team Pass"}
                                  </button>
                                </form>
                              );
                            } else {
                              return (
                                <div className="p-3 bg-amber-50 text-amber-700 text-xs rounded-xl border border-amber-200 text-center">
                                  Waiting for team captain to submit team pass link.
                                </div>
                              );
                            }
                          } else if (isTeam && event.passStrategy === "INDIVIDUAL") {
                             return (
                                <form onSubmit={handleSubmitTeamPass} className="space-y-3 pt-2">
                                  <div>
                                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
                                      Paste My External Pass URL *
                                    </label>
                                    <input
                                      type="text"
                                      required
                                      value={passUrlInput}
                                      onChange={(e) => setPassUrlInput(e.target.value)}
                                      placeholder="e.g. https://makemypass.com/t/..."
                                      className="w-full px-3 py-2 bg-white border border-border-subtle rounded-xl text-on-surface text-xs placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                  </div>
                                  <button
                                    type="submit"
                                    disabled={loading || !passUrlInput.trim()}
                                    className="w-full py-2.5 px-4 bg-primary hover:bg-primary-container text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
                                  >
                                    {loading ? "Submitting..." : "Save My Pass"}
                                  </button>
                                </form>
                             );
                          }
                          return null;
                        }
                      })()
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowPass(true)}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-xs text-center block transition flex items-center justify-center gap-2"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        Show My Pass
                      </button>
                    )}
                    <Link
                      href="/"
                      className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs text-center block transition"
                    >
                      Back to Dashboard
                    </Link>
                  </div>
                ) : isPendingApplication ? (
                  /* Application submitted — awaiting club review */
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-1.5">
                    <ShieldAlert className="w-7 h-7 text-amber-500 mx-auto" />
                    <div className="text-sm font-bold text-amber-700">
                      Application Under Review
                    </div>
                    <div className="text-xs text-amber-600/80">
                      Your application has been submitted. The club will review
                      it — if you&apos;re selected, your pass will appear here.
                    </div>
                  </div>
                ) : isRejectedApplication ? (
                  /* Application reviewed and not selected */
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-center space-y-1.5">
                    <ShieldAlert className="w-7 h-7 text-red-500 mx-auto" />
                    <div className="text-sm font-bold text-red-600">
                      Application Not Selected
                    </div>
                    <div className="text-xs text-red-500/80">
                      Thank you for applying — unfortunately you were not
                      selected for this event.
                    </div>
                  </div>
                ) : event.isClosed ? (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-border-subtle text-center space-y-1">
                    <ShieldAlert className="w-7 h-7 text-muted mx-auto" />
                    <div className="text-sm font-bold text-on-surface">
                      Event Finalized
                    </div>
                    <div className="text-xs text-muted">
                      This event has ended and attendance is closed.
                    </div>
                  </div>
                ) : isFull ? (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-center space-y-1">
                    <ShieldAlert className="w-7 h-7 text-red-500 mx-auto" />
                    <div className="text-sm font-bold text-red-600">
                      Event Full
                    </div>
                    <div className="text-xs text-red-500/80">
                      All {capacity} seats are taken — registrations are closed.
                    </div>
                  </div>
                ) : !event.registrationOpen ? (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-1">
                    <ShieldAlert className="w-7 h-7 text-amber-500 mx-auto" />
                    <div className="text-sm font-bold text-amber-600">
                      Registrations Paused
                    </div>
                    <div className="text-xs text-amber-600/80">
                      The organizer has temporarily closed registrations.
                    </div>
                  </div>
                ) : event.requiresApproval || event.hasForm ? (
                  /* Shortlist event or event with a form */
                  <div className="space-y-4">
                    <div className="text-xs text-muted leading-relaxed">
                      {event.requiresApproval
                        ? "This event requires an application. Selected applicants receive their pass after the club reviews applications."
                        : "This event requires you to fill out a registration form before receiving your pass."}
                    </div>
                    <Link
                      href={`/events/${event.id}/register`}
                      className="w-full py-3.5 px-4 bg-primary hover:bg-primary-container text-white font-semibold rounded-xl shadow-sm transition duration-150 flex items-center justify-center gap-2 active:scale-95 text-sm text-center"
                    >
                      <span>{event.requiresApproval ? "Apply Now" : "Register Now"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : isExternal ? (
                  <div className="space-y-4">
                    <div className="text-xs text-muted leading-relaxed">
                      This event uses an external registration platform. Register there first, then paste your unique pass link/code below to link it to your AntiGravity dashboard.
                    </div>
                    {user ? (
                      <div className="space-y-4">
                        <a
                          href={
                            event.externalFormUrl?.startsWith("http")
                              ? event.externalFormUrl
                              : `https://${event.externalFormUrl}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3.5 px-4 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold rounded-xl border border-border-subtle transition duration-150 flex items-center justify-center gap-2 active:scale-95 text-sm text-center"
                        >
                          <span>Step 1: Get Pass Externally</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        
                        <form onSubmit={handleClaimExternalPass} className="space-y-3 pt-2 border-t border-border-subtle">
                          <div>
                            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
                              Step 2: Paste Ticket/Pass URL *
                            </label>
                            <input
                              type="text"
                              required
                              value={passUrlInput}
                              onChange={(e) => setPassUrlInput(e.target.value)}
                              placeholder="e.g. https://makemypass.com/t/..."
                              className="w-full px-3 py-2 bg-white border border-border-subtle rounded-xl text-on-surface text-xs placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={loading || !passUrlInput.trim()}
                            className="w-full py-3 px-4 bg-primary hover:bg-primary-container text-white font-semibold rounded-xl text-xs transition duration-150 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                          >
                            {loading ? "Linking..." : "Claim AntiGravity Pass"}
                          </button>
                        </form>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => router.push(`/login?callbackUrl=/events/${event.id}`)}
                        className="w-full py-3.5 px-4 bg-primary hover:bg-primary-container text-white font-semibold rounded-xl shadow-sm transition duration-150 flex items-center justify-center gap-2 active:scale-95 text-sm text-center"
                      >
                        <span>Sign In to Claim Pass</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  /* 4. INTERNAL INDIVIDUAL EVENT REGISTRATION */
                  <div className="space-y-4">
                    <div className="text-xs text-muted leading-relaxed">
                      Individual entry pass. Click below to confirm your
                      attendance.
                    </div>
                    <button
                      type="button"
                      onClick={handleIndividualRegister}
                      disabled={loading}
                      className="w-full py-3.5 px-4 bg-primary hover:bg-primary-container text-white font-semibold rounded-xl shadow-sm transition duration-150 flex items-center justify-center gap-2 active:scale-95 text-sm"
                    >
                      {loading ? "Registering..." : "Claim Individual Pass"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="pt-2 border-t border-border-subtle flex items-center gap-2 text-[11px] text-muted">
                  <ShieldAlert className="w-3.5 h-3.5 text-primary" />
                  <span>
                    Hosted by <strong className="text-on-surface">{event.club.name}</strong> ·
                    verified attendance earns points
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Event poster — shown below the event description / about section */}
        {event.imageUrl && (
          <div className="mt-6 bg-white border border-border-subtle rounded-3xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-border-subtle">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted">
                Event Poster
              </span>
            </div>
            <img
              src={event.imageUrl}
              alt={`${event.title} poster`}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Info strip */}
        <div className="mt-6 flex flex-wrap items-center gap-3 bg-white border border-border-subtle rounded-2xl px-5 py-4 shadow-sm">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Event Details
          </span>
          <span className="hidden sm:block w-px h-4 bg-border-subtle" />
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <Clock className="w-3.5 h-3.5" />
            Ends{" "}
            {new Date(event.endDate).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span className="hidden sm:block w-px h-4 bg-border-subtle" />
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <Users className="w-3.5 h-3.5" />
            {event.requiresApproval
              ? `${event.applicationCount ?? 0} applied · ${event.registrationCount} selected`
              : `${event.registrationCount} student${
                  event.registrationCount !== 1 ? "s" : ""
                } registered`}
          </span>
        </div>
      </div>

      <FeedbackModal
        isOpen={!!feedback}
        onClose={() => setFeedback(null)}
        title={feedback?.title || ""}
        message={feedback?.message || ""}
        type="success"
      />

      {registration?.qrToken && (
        <DigitalPassModal
          isOpen={showPass}
          onClose={() => setShowPass(false)}
          registration={{ id: registration.id, qrToken: registration.qrToken }}
          event={{
            title: event.title,
            startDate: event.startDate,
            location: event.location || "",
          }}
          studentName={user?.name}
        />
      )}
    </div>
  );
}
