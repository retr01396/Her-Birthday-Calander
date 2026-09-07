"use client";

import { Fragment, useState } from "react";
import {
  Calendar,
  Users,
  UserCheck,
  FileText,
  Plus,
  Edit2,
  Check,
  Building,
  Sparkles,
  ShieldCheck,
  Search,
  Save,
  Globe,
  Tag,
  Clock,
  MapPin,
  Trophy,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  updateClubProfile,
  updateMemberRole,
  createOrUpdateClubEvent,
} from "@/app/actions/clubDashboardActions";
import ImageUploader from "@/components/media/ImageUploader";
import MembershipFormSettings from "@/components/leader/MembershipFormSettings";
import { FinalizeEventModal } from "@/components/leader/FinalizeEventModal";
import { ChangePasswordCard } from "@/components/auth/ChangePasswordCard";
import { ClubEmailCard } from "@/components/auth/ClubEmailCard";

type ClubData = {
  id: string;
  name: string;
  slug: string | null;
  username: string;
  email: string | null;
  emailVerifiedAt: Date | null;
  tagline: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  about: string | null;
  category: string;
  recruitmentStatus: string;
  whatsappGroupUrl?: string | null;
  customFormFields?: any;
  membershipRequiresApproval?: boolean;
};

type MemberData = {
  id: string;
  userId: string | null;
  displayName?: string | null;
  roleTitle: string | null;
  isExecutive: boolean;
  joinedAt: Date;
  applicationAnswers?: any;
  user?: {
    id: string;
    name: string;
    email: string;
    department: string | null;
    yearOfStudy: string | null;
  } | null;
};

type EventData = {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: Date;
  capacity: number;
  imageUrl: string | null;
  passType: string;
  registrationFee: number;
  status: string;
  isClosed: boolean;
  isTeamEvent: boolean;
  showCapacityLimit: boolean;
  requiresApproval: boolean;
  pointsPerAttender: number;
  firstPlacePoints: number;
  secondPlacePoints: number;
  thirdPlacePoints: number;
  registrations: { user: { id: string; name: string; email: string } }[];
  teams: { id: string; name: string; _count: { members: number } }[];
  regType?: string;
  externalProvider?: string | null;
  externalRegUrl?: string | null;
};

interface ClubDashboardClientProps {
  club: ClubData;
  members: MemberData[];
  events: EventData[];
  /** Number of membership applications awaiting review. */
  pendingApplications?: number;
}

export function ClubDashboardClient({
  club,
  members: initialMembers,
  events: initialEvents,
  pendingApplications = 0,
}: ClubDashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"events" | "roster" | "profile">("events");
  const [finalizingEvent, setFinalizingEvent] = useState<EventData | null>(null);

  // ── Profile State ──────────────────────────────────────────────────────────
  const [profile, setProfile] = useState({
    tagline: club.tagline || "",
    logoUrl: club.logoUrl || "",
    bannerUrl: club.coverUrl || "",
    aboutMarkdown: club.about || "",
    recruitmentStatus: club.recruitmentStatus || "OPEN_FOR_MEMBERS",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // ── Roster State ───────────────────────────────────────────────────────────
  const [membersList, setMembersList] = useState(initialMembers);
  const [memberSearch, setMemberSearch] = useState("");
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [editRoleTitle, setEditRoleTitle] = useState("");
  const [editIsExec, setEditIsExec] = useState(false);

  // Labels for the joining-form answers (default fields + club custom questions).
  const memberAnswerLabels: Record<string, string> = {
    fullName: "Full Name",
    rollNumber: "Roll Number",
    phone: "Phone Number",
  };
  if (Array.isArray(club.customFormFields)) {
    for (const f of club.customFormFields) {
      if (f && f.id && f.label) memberAnswerLabels[f.id] = f.label;
    }
  }

  const memberAnswerEntries = (m: MemberData) =>
    Object.entries(m.applicationAnswers ?? {}).filter(
      ([, v]) => v !== undefined && v !== null && v !== ""
    );

  // Local calendar date (YYYY-MM-DD) for the event date input.
  // NOTE: not `toISOString()` — that is the UTC date and can be a day off in
  // timezones where the local calendar date differs from UTC's.
  const formatLocalDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  const localToday = formatLocalDate(new Date());
  const formatIndianRupees = (value: number) =>
    value > 0 ? `₹${new Intl.NumberFormat("en-IN").format(value)}` : "Free";

  // ── Event Modal/Form State ──────────────────────────────────────────────────
  const [eventList, setEventList] = useState(initialEvents);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    location: "",
    startDate: localToday,
    startTime: "18:00",
    capacity: 50,
    showCapacityLimit: true,
    imageUrl: "",
    passType: "PASS",
    registrationFee: 0,
    status: "PUBLISHED",
    regType: "INTERNAL",
    externalProvider: "MAKEMYPASS",
    externalRegUrl: "",
  });
  const [eventLoading, setEventLoading] = useState(false);

  // ── Profile Submit ─────────────────────────────────────────────────────────
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const res = await updateClubProfile({
        clubId: club.id,
        ...profile,
      });
      if (res.success) {
        setProfileMsg("Profile & About page updated successfully!");
        setTimeout(() => setProfileMsg(null), 3000);
      }
    } catch (err: any) {
      setProfileMsg(`Error: ${err.message}`);
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Member Role Submit ─────────────────────────────────────────────────────
  const handleSaveMemberRole = async (memberId: string) => {
    try {
      const res = await updateMemberRole({
        memberId,
        roleTitle: editRoleTitle,
        isExecutive: editIsExec,
      });
      if (res.success) {
        setMembersList((prev) =>
          prev.map((m) => (m.id === memberId ? res.member : m))
        );
        setEditingMemberId(null);
      }
    } catch (err: any) {
      alert(`Failed to update member: ${err.message}`);
    }
  };

  const startEditMember = (m: MemberData) => {
    setEditingMemberId(m.id);
    setEditRoleTitle(m.roleTitle || "Member");
    setEditIsExec(m.isExecutive);
  };

  // ── Event Submit ───────────────────────────────────────────────────────────
  const openNewEventModal = () => {
    router.push("/club/dashboard/events/create");
  };

  const openEditEventModal = (ev: EventData) => {
    const d = new Date(ev.startDate);
    const localTime = `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
    const localDate = formatLocalDate(d);
    setEditingEventId(ev.id);
    setEventForm({
      title: ev.title,
      description: ev.description,
      location: ev.location,
      startDate: localDate,
      startTime: localTime,
      capacity: ev.capacity,
      showCapacityLimit: ev.showCapacityLimit,
      imageUrl: ev.imageUrl || "",
      passType: ev.passType,
      registrationFee: ev.registrationFee,
      status: ev.status,
      regType: ev.regType || "INTERNAL",
      externalProvider: ev.externalProvider || "MAKEMYPASS",
      externalRegUrl: ev.externalRegUrl || "",
    });
    setShowEventModal(true);
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guard (create only): the student dashboard only shows upcoming events
    // (startTime >= now). Warn the club up front when creating so a new event
    // is never silently hidden because its date/time already passed. Edits of
    // existing events are never blocked — a club may fix details of an
    // ongoing/past event.
    if (!editingEventId) {
      const chosenStart = new Date(
        `${eventForm.startDate}T${eventForm.startTime}`
      );
      if (isNaN(chosenStart.getTime()) || chosenStart <= new Date()) {
        alert(
          "The event date/time is in the past. Please pick a future date and start time so the event appears on the student dashboard."
        );
        return;
      }
    }

    setEventLoading(true);
    try {
      const res = await createOrUpdateClubEvent({
        id: editingEventId || undefined,
        ...eventForm,
        requiresApproval: eventForm.regType === "INTERNAL" ? (eventForm as any).requiresApproval : false,
        regType: eventForm.regType as any,
        externalProvider: eventForm.regType === "EXTERNAL" ? eventForm.externalProvider as any : undefined,
        externalRegUrl: eventForm.regType === "EXTERNAL" ? eventForm.externalRegUrl.trim() : undefined,
      });
      if (res.success && res.event) {
        if (editingEventId) {
          setEventList((prev) =>
            prev.map((item) => (item.id === editingEventId ? (res.event as any) : item))
          );
        } else {
          setEventList((prev) => [res.event as any, ...prev]);
        }
        setShowEventModal(false);
      }
    } catch (err: any) {
      alert(`Failed to save event: ${err.message}`);
    } finally {
      setEventLoading(false);
    }
  };

  const filteredMembers = membersList.filter((m) => {
    const q = memberSearch.toLowerCase();
    return (
      (m.displayName || m.user?.name || "")
        .toLowerCase()
        .includes(q) ||
      (m.user?.email || "").toLowerCase().includes(q) ||
      (m.roleTitle || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-3xl font-black text-white shadow-inner">
              {club.logoUrl ? (
                <img src={club.logoUrl} alt={club.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                club.name.charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black tracking-tight">{club.name}</h1>
                <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur font-mono">
                  @{club.username}
                </span>
              </div>
              <p className="text-slate-300 text-sm mt-1">{club.tagline || "Club Dashboard Management Portal"}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <a
              href="/club/dashboard/feed/create"
              className="bg-primary hover:bg-primary/90 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2"
            >
              <Plus size={16} />
              Create Feed Post
            </a>
            <a
              href="/club/dashboard/roster"
              className="bg-white/10 hover:bg-white/20 text-white text-sm font-bold px-4 py-2.5 rounded-xl border border-white/20 backdrop-blur transition-all flex items-center gap-2"
            >
              <Users size={16} />
              Roster Studio
            </a>
            <a
              href="/club/dashboard/applications"
              className={`relative bg-white/10 hover:bg-white/20 text-white text-sm font-bold px-4 py-2.5 rounded-xl border backdrop-blur transition-all flex items-center gap-2 ${
                pendingApplications > 0
                  ? "border-amber-400/70 bg-amber-400/15"
                  : "border-white/20"
              }`}
            >
              <UserCheck size={16} />
              Applications
              {pendingApplications > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1.5 rounded-full bg-amber-400 text-slate-900 text-[11px] font-black flex items-center justify-center shadow">
                  {pendingApplications}
                </span>
              )}
            </a>
            <a
              href={`/clubs/${club.slug}`}
              target="_blank"
              rel="noreferrer"
              className="bg-white/10 hover:bg-white/20 text-white text-sm font-bold px-4 py-2.5 rounded-xl border border-white/20 backdrop-blur transition-all flex items-center gap-2"
            >
              <Globe size={16} />
              View Public Page
            </a>
          </div>
        </div>
      </div>

      {/* Management Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-8">
        <button
          onClick={() => setActiveTab("events")}
          className={`pb-4 font-bold text-sm flex items-center gap-2 transition-colors relative ${
            activeTab === "events" ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Calendar size={18} />
          Events Manager ({eventList.length})
        </button>

        <button
          onClick={() => setActiveTab("roster")}
          className={`pb-4 font-bold text-sm flex items-center gap-2 transition-colors relative ${
            activeTab === "roster" ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Users size={18} />
          Roster & Executive Roles ({membersList.length})
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-4 font-bold text-sm flex items-center gap-2 transition-colors relative ${
            activeTab === "profile" ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <FileText size={18} />
          Profile & About Editor
        </button>
      </div>

      {/* ── Tab 1: Events Manager ─────────────────────────────────────────────── */}
      {activeTab === "events" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Club Events</h2>
              <p className="text-sm text-slate-500">Post and manage upcoming workshops, competitions, and meetups.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/club/dashboard/points")}
                className="bg-white border-2 border-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl hover:border-primary/50 hover:text-primary transition-all flex items-center gap-2"
              >
                <Trophy size={18} />
                Attendance & Points
              </button>
              <button
                onClick={openNewEventModal}
                className="bg-primary text-white font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm"
              >
                <Plus size={18} />
                Create Event
              </button>
            </div>
          </div>

          {eventList.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 p-12 text-center rounded-2xl space-y-3">
              <Calendar size={36} className="mx-auto text-slate-400" />
              <h3 className="font-bold text-slate-800">No events posted yet</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Create your first club event to display it on the public club page and student event feed.
              </p>
              <button
                onClick={openNewEventModal}
                className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-xl"
              >
                Create Event Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventList.map((ev) => (
                <div key={ev.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                  {ev.imageUrl ? (
                    <img src={ev.imageUrl} alt={ev.title} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                      {ev.title.charAt(0)}
                    </div>
                  )}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {ev.status}
                        </span>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {new Date(ev.startDate).toLocaleDateString()} ·{" "}
                      {new Date(ev.startDate).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg line-clamp-1">{ev.title}</h3>
                      <p className="text-sm text-slate-600 line-clamp-2 mt-1">{ev.description}</p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-slate-400" />
                        <span>{ev.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Capacity: <strong>{ev.capacity} seats</strong></span>
                        <span>Fee: <strong>{formatIndianRupees(ev.registrationFee)}</strong></span>
                      </div>
                    </div>

                    <button
                      onClick={() => openEditEventModal(ev)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Edit2 size={14} />
                      Edit Event Details
                    </button>

                    {ev.isClosed ? (
                      <span className="w-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5">
                        <Lock size={14} />
                        Finalized
                      </span>
                    ) : (
                      <button
                        onClick={() => setFinalizingEvent(ev)}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Trophy size={14} />
                        Finalize Event
                      </button>
                    )}

                    <div className="grid grid-cols-3 gap-1.5">
                      <a
                        href={`/club/dashboard/events/${ev.id}/form-builder`}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold py-2 rounded-xl transition-colors text-center"
                      >
                        Form
                      </a>
                      <a
                        href={`/club/dashboard/events/${ev.id}/scanner`}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold py-2 rounded-xl transition-colors text-center"
                      >
                        Scanner
                      </a>
                      <a
                        href={`/club/dashboard/events/${ev.id}/responses`}
                        className={`text-[11px] font-bold py-2 rounded-xl transition-colors text-center ${
                          ev.requiresApproval
                            ? "bg-amber-50 hover:bg-amber-100 text-amber-700"
                            : "bg-purple-50 hover:bg-purple-100 text-purple-700"
                        }`}
                      >
                        {ev.requiresApproval ? "Applications" : "Analytics"}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab 2: Roster & Executive Roles ─────────────────────────────────── */}
      {activeTab === "roster" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Club Roster & Executive Team</h2>
              <p className="text-sm text-slate-500">
                Manage enrolled student members and assign leadership roles (e.g. Vice President, Tech Lead). Executive roles are showcased on the public About page.
              </p>
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search member name or email..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm w-full md:w-64 focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] tracking-wider font-bold">
                  <tr>
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Department & Year</th>
                    <th className="p-4">Assigned Role Title</th>
                    <th className="p-4">Leadership Tag</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        No enrolled members matching search.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((m) => {
                      const isEditing = editingMemberId === m.id;
                      const isExpanded = expandedMemberId === m.id;
                      const answers = memberAnswerEntries(m);
                      return (
                        <Fragment key={m.id}>
                          <tr className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedMemberId(
                                      isExpanded ? null : m.id
                                    )
                                  }
                                  title={
                                    answers.length > 0
                                      ? "Show application details"
                                      : "No application details"
                                  }
                                  className={`p-1 rounded-lg transition-colors ${
                                    answers.length > 0
                                      ? "text-slate-400 hover:text-primary hover:bg-slate-100"
                                      : "text-slate-200 cursor-default"
                                  }`}
                                >
                                  {isExpanded ? (
                                    <ChevronUp size={15} />
                                  ) : (
                                    <ChevronDown size={15} />
                                  )}
                                </button>
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900">
                                    {m.displayName || m.user?.name || "Member"}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {m.user ? m.user.email : "Free-form entry"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-slate-600">
                              {m.user ? `${m.user.department || "N/A"} (${m.user.yearOfStudy || "Student"})` : "—"}
                            </td>
                            <td className="p-4">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editRoleTitle}
                                  onChange={(e) => setEditRoleTitle(e.target.value)}
                                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm w-full outline-none focus:ring-2 focus:ring-primary/20"
                                  placeholder="e.g. Vice President"
                                />
                              ) : (
                                <span className="font-semibold text-slate-800">
                                  {m.roleTitle || "Member"}
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              {isEditing ? (
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                                  <input
                                    type="checkbox"
                                    checked={editIsExec}
                                    onChange={(e) => setEditIsExec(e.target.checked)}
                                    className="w-4 h-4 text-primary rounded border-slate-300"
                                  />
                                  Show under Leadership
                                </label>
                              ) : m.isExecutive ? (
                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200">
                                  <ShieldCheck size={14} />
                                  Executive Leader
                                </span>
                              ) : (
                                <span className="text-slate-400 text-xs">General Member</span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              {isEditing ? (
                                <button
                                  onClick={() => handleSaveMemberRole(m.id)}
                                  className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-emerald-700 transition-colors inline-flex items-center gap-1"
                                >
                                  <Check size={14} />
                                  Save
                                </button>
                              ) : (
                                <button
                                  onClick={() => startEditMember(m)}
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                                >
                                  <Edit2 size={14} />
                                  Edit Role
                                </button>
                              )}
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-slate-50/60">
                              <td colSpan={5} className="p-4 pl-12">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                                  <FileText size={12} />
                                  Details Filled at Joining
                                </p>
                                {answers.length === 0 ? (
                                  <p className="text-xs text-slate-400 italic">
                                    No application details were submitted — this
                                    member was added by the club or joined
                                    without a form.
                                  </p>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {answers.map(([key, value], i) => (
                                      <div
                                        key={i}
                                        className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5"
                                      >
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                          {memberAnswerLabels[key] || key}
                                        </p>
                                        <p className="text-sm font-semibold text-slate-800 break-words mt-0.5">
                                          {Array.isArray(value)
                                            ? value.join(", ")
                                            : String(value)}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 3: Profile & About Editor ────────────────────────────────────── */}
      {activeTab === "profile" && (
        <form onSubmit={handleProfileSubmit} className="space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Profile & About Editor</h2>
            <p className="text-sm text-slate-500">Update your club tagline, branding visuals, and Markdown About section.</p>
          </div>

          {profileMsg && (
            <div className={`p-4 rounded-xl text-sm font-bold ${profileMsg.startsWith("Error") ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>
              {profileMsg}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tagline</label>
              <input
                type="text"
                value={profile.tagline}
                onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="Brief one-line motto or tagline..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Logo Image</label>
                <ImageUploader
                  value={profile.logoUrl}
                  onUploadSuccess={(url) => setProfile({ ...profile, logoUrl: url })}
                  buttonLabel="Upload Logo"
                  hint="Upload a club logo (PNG, JPG, WebP)."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Banner Image</label>
                <ImageUploader
                  value={profile.bannerUrl}
                  onUploadSuccess={(url) => setProfile({ ...profile, bannerUrl: url })}
                  buttonLabel="Upload Banner"
                  hint="Upload a cover banner shown on the public club page."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Recruitment Status</label>
              <select
                value={profile.recruitmentStatus}
                onChange={(e) => setProfile({ ...profile, recruitmentStatus: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none bg-white font-medium"
              >
                <option value="OPEN_FOR_MEMBERS">Open for Members (Students can join freely)</option>
                <option value="RECRUITING_BOARD">Recruiting Board / Execs</option>
                <option value="CLOSED">Closed / Not Recruiting</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">About Club (Markdown Support)</label>
              <textarea
                rows={8}
                value={profile.aboutMarkdown}
                onChange={(e) => setProfile({ ...profile, aboutMarkdown: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-mono text-sm"
                placeholder="# Welcome to our Club!&#10;&#10;Describe your mission, activities, meeting schedule, and achievements..."
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={profileLoading}
              className="bg-primary text-white font-bold py-3.5 px-6 rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {profileLoading ? "Saving Changes..." : "Save Profile & About Info"}
            </button>
          </div>
        </form>
      )}

      {/* ── Tab 3b: Membership Application Form (custom questions + WhatsApp) ── */}
      {activeTab === "profile" && (
        <MembershipFormSettings
          clubId={club.id}
          initialWhatsappGroupUrl={club.whatsappGroupUrl}
          initialCustomFormFields={club.customFormFields ?? null}
          initialMembershipRequiresApproval={
            club.membershipRequiresApproval ?? false
          }
        />
      )}

      {/* ── Tab 3c: Club Email — OTP-verified address changes ── */}
      {activeTab === "profile" && (
        <ClubEmailCard clubEmail={club.email} clubUsername={club.username} />
      )}

      {/* ── Tab 3d: Security — OTP-authorized password change ── */}
      {activeTab === "profile" && (
        <ChangePasswordCard clubUsername={club.username} />
      )}

      {/* ── Event Modal ──────────────────────────────────────────────────────── */}
      {showEventModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900">
              {editingEventId ? "Edit Event" : "Create New Club Event"}
            </h3>

            <form onSubmit={handleEventSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Event Title</label>
                <input
                  required
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                  placeholder="e.g. AI & Robotics Hackathon 2026"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                  placeholder="Event details, agenda, requirements..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Location</label>
                  <input
                    required
                    type="text"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                    placeholder="e.g. Main Auditorium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Date</label>
                  <input
                    required
                    type="date"
                    min={editingEventId ? undefined : localToday}
                    value={eventForm.startDate}
                    onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Start Time</label>
                  <input
                    required
                    type="time"
                    value={eventForm.startTime}
                    onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Capacity (Seats)</label>
                  <input
                    required
                    type="number"
                    min={1}
                    value={eventForm.capacity}
                    onChange={(e) => setEventForm({ ...eventForm, capacity: parseInt(e.target.value) || 50 })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Fee (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={eventForm.registrationFee}
                    onChange={(e) => setEventForm({ ...eventForm, registrationFee: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                    placeholder="0 for free"
                  />
                </div>
              </div>

              {/* Registration Platform: Internal vs External */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Registration Platform
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() =>
                      setEventForm((prev) => ({ ...prev, regType: "INTERNAL" }))
                    }
                    className={`rounded-xl border-2 p-3 text-left transition ${
                      eventForm.regType === "INTERNAL"
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <span className="block text-sm font-bold text-slate-900">
                      AntiGravity (Native)
                    </span>
                    <span className="mt-1 block text-[11px] leading-relaxed text-slate-500">
                      Use our built-in passes and ticket scanner.
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEventForm((prev) => ({ ...prev, regType: "EXTERNAL" }))
                    }
                    className={`rounded-xl border-2 p-3 text-left transition ${
                      eventForm.regType === "EXTERNAL"
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <span className="block text-sm font-bold text-slate-900">
                      External Platform
                    </span>
                    <span className="mt-1 block text-[11px] leading-relaxed text-slate-500">
                      Redirect to MakeMyPass, RSVP, etc.
                    </span>
                  </button>
                </div>
              </div>

              {/* If External: Provider & Link */}
              {eventForm.regType === "EXTERNAL" && (
                <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                      External Provider
                    </label>
                    <select
                      value={eventForm.externalProvider || "MAKEMYPASS"}
                      onChange={(e) =>
                        setEventForm((prev) => ({ ...prev, externalProvider: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 font-semibold"
                    >
                      <option value="MAKEMYPASS">MakeMyPass (Sync via Webhook)</option>
                      <option value="RSVP">RSVP (Sync via Webhook)</option>
                      <option value="OTHERS">Others (Google Forms / Manual CSV)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                      Registration Link
                    </label>
                    <input
                      type="url"
                      required
                      value={eventForm.externalRegUrl || ""}
                      onChange={(e) =>
                        setEventForm((prev) => ({ ...prev, externalRegUrl: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="https://makenpass.com/..."
                    />
                  </div>
                </div>
              )}

              {/* Show / hide the capacity bar on the event page */}
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                <div>
                  <span className="block text-xs font-bold text-slate-700">Show capacity limit to students</span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">
                    Displays the live seats-filled bar and "Event Full" state on the event page. Registration still closes automatically at the limit.
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={eventForm.showCapacityLimit}
                  onClick={() => setEventForm({ ...eventForm, showCapacityLimit: !eventForm.showCapacityLimit })}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                    eventForm.showCapacityLimit ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                      eventForm.showCapacityLimit ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </label>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Cover Image (Optional)</label>
                <ImageUploader
                  value={eventForm.imageUrl}
                  onUploadSuccess={(url) => setEventForm({ ...eventForm, imageUrl: url })}
                  buttonLabel="Upload Event Image"
                  hint="Upload a cover image for this event."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={eventLoading}
                  className="flex-1 bg-primary text-white font-bold py-2.5 rounded-xl text-sm hover:bg-primary/90 transition-colors"
                >
                  {eventLoading ? "Saving..." : "Save Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Finalize Event Modal */}
      {finalizingEvent && (
        <FinalizeEventModal
          isOpen={!!finalizingEvent}
          onClose={() => setFinalizingEvent(null)}
          eventId={finalizingEvent.id}
          eventTitle={finalizingEvent.title}
          attendees={finalizingEvent.registrations.map((r) => r.user)}
          isTeamEvent={finalizingEvent.isTeamEvent}
          teams={finalizingEvent.teams.map((t) => ({
            id: t.id,
            name: t.name,
            memberCount: t._count.members,
          }))}
          pointsConfig={{
            participation: finalizingEvent.pointsPerAttender,
            first: finalizingEvent.firstPlacePoints,
            second: finalizingEvent.secondPlacePoints,
            third: finalizingEvent.thirdPlacePoints,
          }}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
}
