"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  GripVertical,
  Edit2,
  Check,
  Search,
  Save,
  Plus,
  Trash2,
  X,
  Camera,
  Loader2,
  LayoutGrid,
  List,
  CreditCard,
  RotateCw,
  CheckCircle2,
  Crown,
  Paintbrush,
  UserPlus,
  UserRound,
} from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  updateMemberProfile,
  updateRosterOrder,
  addRosterMember,
  addFreeformMember,
  removeRosterMember,
  saveRosterSettings,
  searchStudents,
} from "@/app/actions/clubDashboardActions";
import ImageCropper from "@/components/ImageCropper";
import FramedAvatar from "@/components/clubs/FramedAvatar";
import PublicRoster from "@/components/clubs/PublicRoster";
import {
  DEFAULT_ROSTER_SETTINGS,
  FRAME_SHAPE_LABELS,
  FrameShape,
  RosterSettings,
} from "@/types/roster";
import { uploadImageBlob } from "@/lib/cloudinaryUpload";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface StudioMember {
  id: string;
  userId: string | null;
  clubRole: string;
  avatarUrl?: string | null;
  displayName?: string | null;
  className?: string | null;
  roleTitle?: string | null;
  isExecutive: boolean;
  badgeColor?: string | null;
  displayOrder?: number | null;
  joinedAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    department?: string | null;
    yearOfStudy?: string | null;
  } | null;
}

interface RosterClientProps {
  club: {
    id: string;
    name: string;
    slug: string | null;
  };
  initialMembers: StudioMember[];
  initialSettings?: Partial<RosterSettings> | null;
}

// ─── Small design helpers ────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
      {children}
    </span>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: React.ReactNode }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            value === opt.value
              ? "bg-primary text-white shadow-sm"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <FieldLabel>{label}</FieldLabel>
        <span className="text-[11px] font-mono text-slate-400">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#3C7BFF]"
      />
    </div>
  );
}

function ColorField({
  label,
  value,
  presets,
  onChange,
}: {
  label: string;
  value: string;
  presets: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 rounded-lg border border-slate-300 bg-white cursor-pointer p-0.5"
        />
        <span className="font-mono text-[11px] text-slate-500">{value}</span>
        <div className="flex gap-1 ml-auto">
          {presets.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              className={`w-5 h-5 rounded-full border transition-all ${
                value === c
                  ? "border-slate-800 ring-2 ring-[#3C7BFF]"
                  : "border-slate-300"
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function RosterClient({
  club,
  initialMembers,
  initialSettings,
}: RosterClientProps) {
  const router = useRouter();
  const [members, setMembers] = useState<StudioMember[]>(initialMembers);
  const [settings, setSettings] = useState<RosterSettings>({
    ...DEFAULT_ROSTER_SETTINGS,
    ...(initialSettings ?? {}),
  });
  const [tab, setTab] = useState<"members" | "design">("members");

  // ── Member editing state ──
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    displayName: "",
    className: "",
    roleTitle: "",
    isExecutive: false,
    badgeColor: "#d97706",
  });
  const [savingId, setSavingId] = useState<string | null>(null);

  // ── Photo editor state ──
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoTarget, setPhotoTarget] = useState<
    { kind: "member"; memberId: string } | { kind: "draft" } | null
  >(null);
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // ── Add member state ──
  const [addOpen, setAddOpen] = useState(false);
  const [addMode, setAddMode] = useState<"search" | "manual">("search");
  const [addQuery, setAddQuery] = useState("");
  const [addResults, setAddResults] = useState<
    { id: string; name: string; email: string; department?: string | null }[]
  >([]);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [manualDraft, setManualDraft] = useState({
    name: "",
    className: "",
    roleTitle: "Member",
    badgeColor: "#d97706",
    isExecutive: false,
    avatarUrl: "",
  });
  const [manualError, setManualError] = useState<string | null>(null);

  // ── Feedback ──
  const [notice, setNotice] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  const flash = (kind: "success" | "error", text: string) => {
    setNotice({ kind, text });
    window.setTimeout(() => setNotice(null), 4000);
  };

  const isSavingOrder = savingId === "__order__";

  const sortedMembers = [...members].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
  );

  const memberName = (m: StudioMember) =>
    m.displayName || m.user?.name || "Member";

  // ── Drag & drop reorder ──
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const from = result.source.index;
    const to = result.destination.index;
    if (from === to) return;

    const next = Array.from(sortedMembers);
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    const renumbered = next.map((m, index) => ({ ...m, displayOrder: index }));

    setMembers(renumbered);
    setSavingId("__order__");
    try {
      await updateRosterOrder(
        renumbered.map((m) => ({
          memberId: m.id,
          displayOrder: m.displayOrder ?? 0,
        }))
      );
    } catch (err: any) {
      flash("error", err.message || "Failed to save order.");
      setMembers(initialMembers);
    } finally {
      setSavingId(null);
    }
  };

  // ── Member field editing ──
  const startEdit = (m: StudioMember) => {
    setEditingId(m.id);
    setDraft({
      displayName: m.displayName || "",
      className: m.className || "",
      roleTitle: m.roleTitle || "Member",
      isExecutive: m.isExecutive,
      badgeColor: m.badgeColor || "#d97706",
    });
  };

  const handleSaveMember = async (memberId: string) => {
    setSavingId(memberId);
    try {
      const res = await updateMemberProfile({
        memberId,
        displayName: draft.displayName.trim() || null,
        className: draft.className.trim() || null,
        roleTitle: draft.roleTitle.trim() || "Member",
        isExecutive: draft.isExecutive,
        badgeColor: draft.badgeColor,
      });
      if (res.success && res.member) {
        setMembers((prev) =>
          prev.map((m) => (m.id === memberId ? (res.member as any) : m))
        );
        setEditingId(null);
        flash("success", "Member profile updated.");
      }
    } catch (err: any) {
      flash("error", err.message || "Failed to save member.");
    } finally {
      setSavingId(null);
    }
  };

  // ── Photo upload → crop → save ──
  const pickPhoto = (target: { kind: "member"; memberId: string } | { kind: "draft" }) => {
    setPhotoTarget(target);
    setPhotoSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    fileInputRef.current?.click();
  };

  const handleFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoSrc(URL.createObjectURL(file));
    setShowCropper(true);
  };

  const handleCropComplete = async (blob: Blob) => {
    if (!photoTarget) return;
    setUploadingPhoto(true);
    try {
      const url = await uploadImageBlob(blob);
      if (photoTarget.kind === "member") {
        const res = await updateMemberProfile({
          memberId: photoTarget.memberId,
          avatarUrl: url,
        });
        if (res.success && res.member) {
          setMembers((prev) =>
            prev.map((m) =>
              m.id === photoTarget.memberId ? (res.member as any) : m
            )
          );
          flash("success", "Photo updated.");
        }
      } else {
        setManualDraft((prev) => ({ ...prev, avatarUrl: url }));
        flash("success", "Photo ready — add the member to save.");
      }
    } catch (err: any) {
      flash("error", err.message || "Photo upload failed.");
    } finally {
      setUploadingPhoto(false);
      setPhotoTarget(null);
      setPhotoSrc(null);
      setShowCropper(false);
    }
  };

  const handleRemovePhoto = async (memberId: string) => {
    setSavingId(memberId);
    try {
      const res = await updateMemberProfile({ memberId, avatarUrl: null });
      if (res.success && res.member) {
        setMembers((prev) =>
          prev.map((m) => (m.id === memberId ? (res.member as any) : m))
        );
      }
    } catch (err: any) {
      flash("error", err.message || "Failed to remove photo.");
    } finally {
      setSavingId(null);
    }
  };

  // ── Add member: search students ──
  useEffect(() => {
    if (!addOpen || addMode !== "search" || addQuery.trim().length < 2) {
      setAddResults([]);
      return;
    }
    const t = window.setTimeout(async () => {
      try {
        const results = await searchStudents(addQuery);
        setAddResults(results as any);
      } catch (err) {
        setAddResults([]);
      }
    }, 250);
    return () => window.clearTimeout(t);
  }, [addQuery, addOpen, addMode]);

  const handleAddMember = async (userId: string) => {
    setAddingId(userId);
    try {
      const res = await addRosterMember(club.id, userId);
      if (res.success && res.member) {
        setMembers((prev) => [...prev, res.member as any]);
        closeAddModal();
        flash("success", "Member added to the roster.");
      }
    } catch (err: any) {
      flash("error", err.message || "Failed to add member.");
    } finally {
      setAddingId(null);
    }
  };

  // ── Add member: free-form (no account) ──
  const handleAddFreeform = async () => {
    if (!manualDraft.name.trim()) {
      setManualError("Please enter the member's name.");
      return;
    }
    setManualError(null);
    setAddingId("__manual__");
    try {
      const res = await addFreeformMember(club.id, {
        name: manualDraft.name,
        className: manualDraft.className.trim() || null,
        roleTitle: manualDraft.roleTitle.trim() || "Member",
        avatarUrl: manualDraft.avatarUrl || null,
        badgeColor: manualDraft.badgeColor,
        isExecutive: manualDraft.isExecutive,
      });
      if (res.success && res.member) {
        setMembers((prev) => [...prev, res.member as any]);
        closeAddModal();
        flash("success", "Member added to the roster.");
      }
    } catch (err: any) {
      flash("error", err.message || "Failed to add member.");
    } finally {
      setAddingId(null);
    }
  };

  const closeAddModal = () => {
    setAddOpen(false);
    setAddMode("search");
    setAddQuery("");
    setAddResults([]);
    setManualDraft({
      name: "",
      className: "",
      roleTitle: "Member",
      badgeColor: "#d97706",
      isExecutive: false,
      avatarUrl: "",
    });
    setManualError(null);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!window.confirm("Remove this member from the roster?")) return;
    setSavingId(memberId);
    try {
      const res = await removeRosterMember(memberId);
      if (res.success) {
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
        flash("success", "Member removed.");
      }
    } catch (err: any) {
      flash("error", err.message || "Failed to remove member.");
    } finally {
      setSavingId(null);
    }
  };

  // ── Design settings ──
  const handleSaveSettings = async () => {
    setSavingId("__settings__");
    try {
      await saveRosterSettings(club.id, settings as any);
      flash("success", "Roster design saved and published.");
      router.refresh();
    } catch (err: any) {
      flash("error", err.message || "Failed to save design.");
    } finally {
      setSavingId(null);
    }
  };

  const patch = (p: Partial<RosterSettings>) =>
    setSettings((prev) => ({ ...prev, ...p }));

  const badgePresets = ["#d97706", "#4f46e5", "#059669", "#dc2626", "#0ea5e9", "#7c3aed"];
  const bgPresets = ["#ffffff", "#f8fafc", "#f1f5f9", "#0f172a", "#eef2ff", "#fdf2f8"];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Hidden file input for photo picking */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChosen}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/club/dashboard")}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Roster Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {club.name} — Roster Page
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Add members (with or without accounts), edit photos &amp; frames,
              and design how the roster looks publicly.
            </p>
          </div>
        </div>

        {notice && (
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold ${
              notice.kind === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : "bg-red-50 border border-red-200 text-red-600"
            }`}
          >
            {notice.kind === "success" ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <X className="w-3.5 h-3.5" />
            )}
            {notice.text}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-8">
        <button
          onClick={() => setTab("members")}
          className={`pb-4 font-bold text-sm flex items-center gap-2 transition-colors relative ${
            tab === "members"
              ? "text-primary border-b-2 border-primary"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Users size={18} />
          Members ({members.length})
        </button>
        <button
          onClick={() => setTab("design")}
          className={`pb-4 font-bold text-sm flex items-center gap-2 transition-colors relative ${
            tab === "design"
              ? "text-primary border-b-2 border-primary"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Paintbrush size={18} />
          Design &amp; Layout
        </button>
      </div>

      {/* ════════ MEMBERS TAB ════════ */}
      {tab === "members" && (
        <div className="space-y-6">
          {/* Add member bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Roster Members</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Add students from accounts, or add anyone directly (faculty,
                alumni, guests) with just a name, class and photo.
              </p>
            </div>
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 px-4 py-2.5 rounded-xl transition-colors self-start"
            >
              <Plus size={16} />
              Add Member
            </button>
          </div>

          {/* Drag & drop list */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-primary" />
                  Roster Order
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Drag the handle to reorder. This order is shown on the public
                  club page.
                </p>
              </div>
              {isSavingOrder && (
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-primary animate-pulse">
                  <Loader2 size={12} className="animate-spin" />
                  Saving order...
                </span>
              )}
            </div>

            {sortedMembers.length === 0 ? (
              <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-sm">
                No members yet. Click &quot;Add Member&quot; to get started.
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="roster-list">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-3"
                    >
                      {sortedMembers.map((m, index) => {
                        const isEditing = editingId === m.id;
                        const name = memberName(m);
                        const isBusy =
                          savingId === m.id || savingId === "__settings__";
                        return (
                          <Draggable
                            key={m.id}
                            draggableId={m.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`p-4 rounded-2xl border transition-all ${
                                  snapshot.isDragging
                                    ? "bg-slate-50 border-primary shadow-lg scale-[1.01] ring-2 ring-primary/30"
                                    : "bg-white border-slate-200 hover:border-slate-300"
                                }`}
                              >
                                <div className="flex items-start gap-4">
                                  {/* Drag handle */}
                                  <div
                                    {...provided.dragHandleProps}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-grab active:cursor-grabbing hover:bg-slate-100 transition mt-6"
                                    title="Drag to reorder"
                                  >
                                    <GripVertical className="w-4 h-4" />
                                  </div>

                                  {/* Rank + avatar */}
                                  <div className="flex flex-col items-center gap-1.5">
                                    <span className="text-[10px] font-mono font-bold text-slate-400">
                                      #{index + 1}
                                    </span>
                                    <div className="relative group">
                                      <FramedAvatar
                                        src={m.avatarUrl}
                                        name={name}
                                        shape={settings.frameShape}
                                        borderColor={settings.frameBorderColor}
                                        borderWidth={settings.frameBorderWidth}
                                        shadow={settings.frameShadow}
                                        size={64}
                                      />
                                      <button
                                        onClick={() =>
                                          pickPhoto({
                                            kind: "member",
                                            memberId: m.id,
                                          })
                                        }
                                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center shadow-md transition-all"
                                        title="Edit photo (upload, crop, frame)"
                                      >
                                        <Camera size={11} />
                                      </button>
                                    </div>
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => handleRemovePhoto(m.id)}
                                        disabled={!m.avatarUrl || isBusy}
                                        className="text-[9px] text-slate-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                                        title="Remove photo"
                                      >
                                        clear
                                      </button>
                                    </div>
                                  </div>

                                  {/* Fields */}
                                  <div className="flex-1 min-w-0">
                                    {isEditing ? (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                          <FieldLabel>Display Name</FieldLabel>
                                          <input
                                            value={draft.displayName}
                                            onChange={(e) =>
                                              setDraft({
                                                ...draft,
                                                displayName: e.target.value,
                                              })
                                            }
                                            placeholder={m.user?.name || "Name shown publicly"}
                                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
                                          />
                                        </div>
                                        <div>
                                          <FieldLabel>Class / Year (text)</FieldLabel>
                                          <input
                                            value={draft.className}
                                            onChange={(e) =>
                                              setDraft({
                                                ...draft,
                                                className: e.target.value,
                                              })
                                            }
                                            placeholder="e.g. Class of 2027 · CS-A"
                                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
                                          />
                                        </div>
                                        <div>
                                          <FieldLabel>Role / Title</FieldLabel>
                                          <input
                                            value={draft.roleTitle}
                                            onChange={(e) =>
                                              setDraft({
                                                ...draft,
                                                roleTitle: e.target.value,
                                              })
                                            }
                                            placeholder="e.g. Vice President"
                                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
                                          />
                                        </div>
                                        <div>
                                          <FieldLabel>Badge Color</FieldLabel>
                                          <div className="flex items-center gap-1.5">
                                            <input
                                              type="color"
                                              value={draft.badgeColor}
                                              onChange={(e) =>
                                                setDraft({
                                                  ...draft,
                                                  badgeColor: e.target.value,
                                                })
                                              }
                                              className="w-8 h-8 rounded-lg border border-slate-300 bg-white cursor-pointer p-0.5"
                                            />
                                            {badgePresets.map((c) => (
                                              <button
                                                key={c}
                                                type="button"
                                                onClick={() =>
                                                  setDraft({
                                                    ...draft,
                                                    badgeColor: c,
                                                  })
                                                }
                                                className={`w-4 h-4 rounded-full border transition-all ${
                                                  draft.badgeColor === c
                                                    ? "ring-2 ring-primary border-white"
                                                    : "border-slate-300"
                                                }`}
                                                style={{ backgroundColor: c }}
                                                aria-label={`Badge ${c}`}
                                              />
                                            ))}
                                          </div>
                                        </div>
                                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 sm:col-span-2 cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={draft.isExecutive}
                                            onChange={(e) =>
                                              setDraft({
                                                ...draft,
                                                isExecutive: e.target.checked,
                                              })
                                            }
                                            className="w-4 h-4 rounded text-[#3C7BFF] bg-white border-slate-300 focus:ring-primary"
                                          />
                                          <Crown size={13} className="text-amber-500" />
                                          Executive / Leadership member
                                        </label>
                                      </div>
                                    ) : (
                                      <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate flex items-center gap-1.5">
                                          {name}
                                          {m.isExecutive && (
                                            <Crown
                                              size={13}
                                              className="text-amber-500 shrink-0"
                                            />
                                          )}
                                        </p>
                                        <p className="text-[11px] text-slate-400 truncate">
                                          {m.user
                                            ? `${m.user.email} · ${m.user.department || "Student"}`
                                            : "Free-form entry · no account"}
                                        </p>
                                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                                          {m.className && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700">
                                              {m.className}
                                            </span>
                                          )}
                                          <span
                                            className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-white"
                                            style={{
                                              backgroundColor:
                                                m.badgeColor || "#d97706",
                                            }}
                                          >
                                            {m.roleTitle || "Member"}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Actions */}
                                  <div className="flex flex-col gap-1.5 shrink-0">
                                    {isEditing ? (
                                      <>
                                        <button
                                          onClick={() => handleSaveMember(m.id)}
                                          disabled={isBusy}
                                          className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors disabled:opacity-50"
                                        >
                                          {isBusy ? (
                                            <Loader2
                                              size={12}
                                              className="animate-spin"
                                            />
                                          ) : (
                                            <Check size={12} />
                                          )}
                                          Save
                                        </button>
                                        <button
                                          onClick={() => setEditingId(null)}
                                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold transition-colors"
                                        >
                                          Cancel
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => startEdit(m)}
                                          className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors"
                                        >
                                          <Edit2 size={11} />
                                          Edit
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleRemoveMember(m.id)
                                          }
                                          disabled={isBusy}
                                          className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-[11px] font-bold transition-colors disabled:opacity-50"
                                        >
                                          <Trash2 size={11} />
                                          Remove
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </div>
      )}

      {/* ════════ DESIGN TAB ════════ */}
      {tab === "design" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-6">
          {/* Controls */}
          <div className="space-y-5">
            {/* Layout */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <LayoutGrid size={15} className="text-primary" />
                Layout &amp; Spacing
              </h3>
              <div>
                <FieldLabel>Layout</FieldLabel>
                <Segmented
                  value={settings.layout}
                  onChange={(v) => patch({ layout: v })}
                  options={[
                    {
                      value: "grid",
                      label: (
                        <span className="flex items-center gap-1.5">
                          <LayoutGrid size={13} /> Grid
                        </span>
                      ),
                    },
                    {
                      value: "cards",
                      label: (
                        <span className="flex items-center gap-1.5">
                          <CreditCard size={13} /> Cards
                        </span>
                      ),
                    },
                    {
                      value: "list",
                      label: (
                        <span className="flex items-center gap-1.5">
                          <List size={13} /> List
                        </span>
                      ),
                    },
                  ]}
                />
              </div>
              <SliderField
                label="Gap between members"
                value={settings.gap}
                min={4}
                max={40}
                suffix="px"
                onChange={(v) => patch({ gap: v })}
              />
              <div>
                <FieldLabel>Text alignment</FieldLabel>
                <Segmented
                  value={settings.textAlign}
                  onChange={(v) => patch({ textAlign: v })}
                  options={[
                    { value: "left", label: "Left" },
                    { value: "center", label: "Center" },
                    { value: "right", label: "Right" },
                  ]}
                />
              </div>
              <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 cursor-pointer">
                <div>
                  <span className="block text-xs font-bold text-slate-800">
                    Card frames around members
                  </span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">
                    Show a bordered card behind each member (grid / cards layouts).
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.showCards}
                  onClick={() => patch({ showCards: !settings.showCards })}
                  className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                    settings.showCards ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                      settings.showCards ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </label>
              {settings.showCards && (
                <>
                  <ColorField
                    label="Card border color"
                    value={settings.cardBorderColor}
                    presets={["#e2e8f0", "#cbd5e1", "#94a3b8", "#4f46e5", "#0f172a"]}
                    onChange={(v) => patch({ cardBorderColor: v })}
                  />
                  <SliderField
                    label="Card corner radius"
                    value={settings.cardRadius}
                    min={0}
                    max={32}
                    suffix="px"
                    onChange={(v) => patch({ cardRadius: v })}
                  />
                </>
              )}
              <ColorField
                label="Roster background"
                value={settings.bgColor}
                presets={bgPresets}
                onChange={(v) => patch({ bgColor: v })}
              />
            </div>

            {/* Photo frames */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <RotateCw size={15} className="text-primary" />
                Photo Frames
              </h3>
              <div>
                <FieldLabel>Frame shape</FieldLabel>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(FRAME_SHAPE_LABELS) as FrameShape[]).map(
                    (shape) => (
                      <button
                        key={shape}
                        type="button"
                        onClick={() => patch({ frameShape: shape })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          settings.frameShape === shape
                            ? "bg-primary text-white shadow-sm"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                        }`}
                      >
                        {FRAME_SHAPE_LABELS[shape]}
                      </button>
                    )
                  )}
                </div>
              </div>
              <SliderField
                label="Frame border thickness"
                value={settings.frameBorderWidth}
                min={0}
                max={10}
                suffix="px"
                onChange={(v) => patch({ frameBorderWidth: v })}
              />
              <ColorField
                label="Frame border color"
                value={settings.frameBorderColor}
                presets={["#3C7BFF", "#0f172a", "#ffffff", "#d97706", "#059669", "#dc2626"]}
                onChange={(v) => patch({ frameBorderColor: v })}
              />
              <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 cursor-pointer">
                <div>
                  <span className="block text-xs font-bold text-slate-800">
                    Drop shadow under photos
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.frameShadow}
                  onClick={() => patch({ frameShadow: !settings.frameShadow })}
                  className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                    settings.frameShadow ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                      settings.frameShadow ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </label>
            </div>

            {/* Typography */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Paintbrush size={15} className="text-primary" />
                Typography &amp; Badges
              </h3>
              <div>
                <FieldLabel>Font family</FieldLabel>
                <Segmented
                  value={settings.fontFamily}
                  onChange={(v) => patch({ fontFamily: v })}
                  options={[
                    { value: "sans", label: "Sans" },
                    { value: "serif", label: "Serif" },
                    { value: "mono", label: "Mono" },
                  ]}
                />
              </div>
              <div>
                <FieldLabel>Name size</FieldLabel>
                <Segmented
                  value={settings.nameSize}
                  onChange={(v) => patch({ nameSize: v })}
                  options={[
                    { value: "sm", label: "S" },
                    { value: "md", label: "M" },
                    { value: "lg", label: "L" },
                    { value: "xl", label: "XL" },
                  ]}
                />
              </div>
              <SliderField
                label="Name weight"
                value={settings.nameWeight}
                min={400}
                max={900}
                step={100}
                onChange={(v) => patch({ nameWeight: v })}
              />
              <ColorField
                label="Name color"
                value={settings.nameColor}
                presets={["#0f172a", "#334155", "#ffffff", "#3C7BFF", "#b45309"]}
                onChange={(v) => patch({ nameColor: v })}
              />
              <div>
                <FieldLabel>Class / detail size</FieldLabel>
                <Segmented
                  value={settings.detailSize}
                  onChange={(v) => patch({ detailSize: v })}
                  options={[
                    { value: "xs", label: "XS" },
                    { value: "sm", label: "S" },
                    { value: "md", label: "M" },
                  ]}
                />
              </div>
              <ColorField
                label="Class / detail color"
                value={settings.detailColor}
                presets={["#64748b", "#94a3b8", "#334155", "#ffffff"]}
                onChange={(v) => patch({ detailColor: v })}
              />
              <div>
                <FieldLabel>Badge style</FieldLabel>
                <Segmented
                  value={settings.badgeStyle}
                  onChange={(v) => patch({ badgeStyle: v })}
                  options={[
                    { value: "filled", label: "Filled" },
                    { value: "outline", label: "Outline" },
                  ]}
                />
              </div>
              <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 cursor-pointer">
                <div>
                  <span className="block text-xs font-bold text-slate-800">
                    Show role badges
                  </span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">
                    Display the member&apos;s role title under their name.
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.showBadges}
                  onClick={() => patch({ showBadges: !settings.showBadges })}
                  className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                    settings.showBadges ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                      settings.showBadges ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </label>
              <div>
                <FieldLabel>Hover effect</FieldLabel>
                <Segmented
                  value={settings.hoverEffect}
                  onChange={(v) => patch({ hoverEffect: v })}
                  options={[
                    { value: "none", label: "None" },
                    { value: "scale", label: "Scale" },
                    { value: "shadow", label: "Shadow" },
                  ]}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSaveSettings}
                disabled={savingId === "__settings__"}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors disabled:opacity-50"
              >
                {savingId === "__settings__" ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Save size={15} />
                )}
                Save &amp; Publish Design
              </button>
              <button
                onClick={() => setSettings({ ...DEFAULT_ROSTER_SETTINGS })}
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Live preview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Preview
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="mb-4">
                <h4 className="text-slate-900 font-black text-xl">
                  {club.name} Team
                </h4>
                <p className="text-xs text-slate-500">
                  This is how your roster page will look to visitors.
                </p>
              </div>
              <PublicRoster members={sortedMembers} settings={settings} />
            </div>
          </div>
        </div>
      )}

      {/* ════════ ADD MEMBER MODAL ════════ */}
      {addOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Add Member to Roster
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Link a student account, or add anyone directly with just a
                  name and photo.
                </p>
              </div>
              <button
                onClick={closeAddModal}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mode tabs */}
            <div className="px-6 pt-4 flex gap-2">
              <button
                onClick={() => setAddMode("search")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  addMode === "search"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                <Search size={13} />
                Search Student
              </button>
              <button
                onClick={() => setAddMode("manual")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  addMode === "manual"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                <UserPlus size={13} />
                Add Manually
              </button>
            </div>

            <div className="p-6">
              {addMode === "search" ? (
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-2">
                    Search a student to add (name, email or handle)
                  </p>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      autoFocus
                      value={addQuery}
                      onChange={(e) => setAddQuery(e.target.value)}
                      placeholder="e.g. aarav@campus.edu or a student name"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  {addResults.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {addResults.map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {r.name}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {r.email} · {r.department || "Student"}
                            </p>
                          </div>
                          <button
                            onClick={() => handleAddMember(r.id)}
                            disabled={addingId === r.id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
                          >
                            {addingId === r.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Plus size={12} />
                            )}
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {addQuery.trim().length >= 2 && addResults.length === 0 && (
                    <p className="mt-3 text-[11px] text-slate-500">
                      No students found — they may already be on the roster. Try
                      the &quot;Add Manually&quot; tab instead.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Photo */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <FramedAvatar
                        src={manualDraft.avatarUrl || null}
                        name={manualDraft.name || "?"}
                        shape={settings.frameShape}
                        borderColor={settings.frameBorderColor}
                        borderWidth={settings.frameBorderWidth}
                        shadow={settings.frameShadow}
                        size={72}
                      />
                      <button
                        onClick={() => pickPhoto({ kind: "draft" })}
                        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center shadow-md transition-all"
                        title="Upload photo (crop & frame)"
                      >
                        <Camera size={12} />
                      </button>
                    </div>
                    <div className="text-xs text-slate-500 leading-relaxed">
                      <p className="font-bold text-slate-700 mb-0.5">
                        Member photo
                      </p>
                      Upload a photo — you can crop it and it will use the
                      current frame shape from your design settings.
                    </div>
                  </div>

                  {manualError && (
                    <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                      {manualError}
                    </p>
                  )}

                  <div>
                    <FieldLabel>Name *</FieldLabel>
                    <input
                      type="text"
                      value={manualDraft.name}
                      onChange={(e) =>
                        setManualDraft({ ...manualDraft, name: e.target.value })
                      }
                      placeholder="e.g. Dr. Meera Nair"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel>Class / Year (text)</FieldLabel>
                      <input
                        type="text"
                        value={manualDraft.className}
                        onChange={(e) =>
                          setManualDraft({
                            ...manualDraft,
                            className: e.target.value,
                          })
                        }
                        placeholder="e.g. Class of 2027"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <FieldLabel>Role / Title</FieldLabel>
                      <input
                        type="text"
                        value={manualDraft.roleTitle}
                        onChange={(e) =>
                          setManualDraft({
                            ...manualDraft,
                            roleTitle: e.target.value,
                          })
                        }
                        placeholder="e.g. Faculty Advisor"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Badge Color</FieldLabel>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={manualDraft.badgeColor}
                        onChange={(e) =>
                          setManualDraft({
                            ...manualDraft,
                            badgeColor: e.target.value,
                          })
                        }
                        className="w-8 h-8 rounded-lg border border-slate-300 bg-white cursor-pointer p-0.5"
                      />
                      {badgePresets.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() =>
                            setManualDraft({ ...manualDraft, badgeColor: c })
                          }
                          className={`w-4 h-4 rounded-full border transition-all ${
                            manualDraft.badgeColor === c
                              ? "ring-2 ring-primary border-white"
                              : "border-slate-300"
                          }`}
                          style={{ backgroundColor: c }}
                          aria-label={`Badge ${c}`}
                        />
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={manualDraft.isExecutive}
                      onChange={(e) =>
                        setManualDraft({
                          ...manualDraft,
                          isExecutive: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-[#3C7BFF] border-slate-300 focus:ring-primary"
                    />
                    <UserRound size={13} className="text-amber-500" />
                    Executive / Leadership member
                  </label>

                  <button
                    onClick={handleAddFreeform}
                    disabled={addingId === "__manual__"}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    {addingId === "__manual__" ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Plus size={15} />
                    )}
                    Add to Roster
                  </button>
                  <p className="text-[11px] text-slate-400 text-center">
                    Free-form entries don&apos;t need a student account — great
                    for faculty, alumni and guests.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Photo cropper modal */}
      <ImageCropper
        isOpen={showCropper}
        onClose={() => {
          setShowCropper(false);
          setPhotoSrc(null);
          setPhotoTarget(null);
        }}
        imageSrc={photoSrc || ""}
        aspectRatio={1}
        title="Crop Member Photo"
        onCropComplete={handleCropComplete}
      />

      {/* Uploading overlay */}
      {uploadingPhoto && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-3 shadow-2xl">
            <Loader2 size={20} className="animate-spin text-primary" />
            <p className="text-sm font-semibold text-slate-900">
              Uploading photo...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
