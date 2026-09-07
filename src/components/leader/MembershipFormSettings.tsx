"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  MessageCircle,
  ClipboardList,
  HelpCircle,
  Type,
  AlignLeft,
  Link2,
  ChevronDown,
  CircleDot,
  CheckSquare,
  ImagePlus,
  UserCheck,
} from "lucide-react";
import type { ClubJoiningField } from "@/components/ClubJoiningFlow";

// ─── Types ───────────────────────────────────────────────────────────────────

interface MembershipFormSettingsProps {
  clubId: string;
  initialWhatsappGroupUrl?: string | null;
  initialCustomFormFields?: ClubJoiningField[] | null;
  /** When true, applications stay PENDING until the club approves them. */
  initialMembershipRequiresApproval?: boolean;
}

const FIELD_TYPE_OPTIONS: {
  value: ClubJoiningField["type"];
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "text", label: "Short Answer", icon: Type },
  { value: "textarea", label: "Paragraph", icon: AlignLeft },
  { value: "url", label: "Link / URL", icon: Link2 },
  { value: "select", label: "Dropdown", icon: ChevronDown },
  { value: "radio", label: "Multiple Choice", icon: CircleDot },
  { value: "checkbox", label: "Checkboxes", icon: CheckSquare },
  { value: "image", label: "Image Upload", icon: ImagePlus },
];

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Lets a club leader configure what students must answer when applying to
 * join — the dynamic membership form — plus the official WhatsApp group link
 * shown after a successful application.
 */
export default function MembershipFormSettings({
  clubId,
  initialWhatsappGroupUrl,
  initialCustomFormFields,
  initialMembershipRequiresApproval = false,
}: MembershipFormSettingsProps) {
  const router = useRouter();
  const [whatsappUrl, setWhatsappUrl] = useState(
    initialWhatsappGroupUrl ?? ""
  );
  const [requiresApproval, setRequiresApproval] = useState(
    initialMembershipRequiresApproval
  );
  const [fields, setFields] = useState<ClubJoiningField[]>(
    initialCustomFormFields && initialCustomFormFields.length > 0
      ? initialCustomFormFields
      : []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const addField = () => {
    setFields((prev) => [
      ...prev,
      {
        id: `field_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        label: "Untitled Question",
        type: "text",
        isRequired: true,
        placeholder: "Type your answer...",
      },
    ]);
  };

  const updateField = (
    id: string,
    updates: Partial<ClubJoiningField>
  ) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setToast(null);
    try {
      const { updateClubMembershipForm } = await import(
        "@/app/actions/clubActions"
      );
      await updateClubMembershipForm(clubId, {
        whatsappGroupUrl: whatsappUrl.trim() || null,
        membershipRequiresApproval: requiresApproval,
        customFormFields:
          fields.length > 0
            ? fields.map((f) => ({
                id: f.id,
                label: f.label,
                type: f.type,
                placeholder: f.placeholder,
                helpText: f.helpText,
                options: f.options,
                isRequired: f.isRequired,
              }))
            : null,
      });
      showToast("success", "Membership form saved successfully!");
      router.refresh();
    } catch (err: any) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to save membership form."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl shadow-sm overflow-hidden">
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border animate-in slide-in-from-bottom-5 duration-300 ${
            toast.type === "success"
              ? "bg-emerald-950 text-emerald-200 border-emerald-800/50"
              : "bg-red-950 text-red-200 border-red-800/50"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
          )}
          <span className="text-sm font-semibold">{toast.text}</span>
        </div>
      )}

      {/* Membership Review Mode */}
      <div className="p-6 sm:p-8 border-b border-border-subtle">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <h2 className="font-bold text-on-surface text-base mb-1.5 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" />
              Review Applications Before Accepting Members
            </h2>
            <p className="text-xs text-muted leading-relaxed max-w-xl">
              <strong className="text-on-surface">Off (default):</strong>{" "}
              students become members instantly when they apply.
              <br />
              <strong className="text-on-surface">On:</strong> applications stay
              pending until you review the form details and approve them from the{" "}
              <a
                href="/club/dashboard/applications"
                className="text-primary font-bold hover:underline"
              >
                Applications page
              </a>
              . Only approved students become members.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={requiresApproval}
            onClick={() => setRequiresApproval((v) => !v)}
            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 mt-0.5 ${
              requiresApproval ? "bg-emerald-500" : "bg-slate-300"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                requiresApproval ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      {/* WhatsApp Group Link */}
      <div className="p-6 sm:p-8 border-b border-border-subtle">
        <h2 className="font-bold text-on-surface text-base mb-1.5 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-emerald-500" />
          WhatsApp Group Link
        </h2>
        <p className="text-xs text-muted mb-5">
          Shown to students right after their application is submitted. Create a
          WhatsApp group, open{" "}
          <span className="font-mono text-xs">Group info → Invite via link</span>,
          and paste the invite link here.
        </p>
        <input
          value={whatsappUrl}
          onChange={(e) => setWhatsappUrl(e.target.value)}
          placeholder="https://chat.whatsapp.com/..."
          className="w-full px-4 py-3 rounded-xl border border-border-subtle focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm bg-white"
        />
      </div>

      {/* Custom Questions */}
      <div className="p-6 sm:p-8 border-b border-border-subtle">
        <div className="flex items-center justify-between mb-1.5">
          <h2 className="font-bold text-on-surface text-base flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" />
            Application Questions
          </h2>
          <span className="text-[11px] font-bold text-muted bg-surface-container-low border border-border-subtle px-2.5 py-1 rounded-full">
            {fields.length} custom question{fields.length !== 1 ? "s" : ""}
          </span>
        </div>
        <p className="text-xs text-muted mb-5">
          Beyond Full Name, Roll Number and Phone (auto-asked), students must
          answer these questions when applying to join.
        </p>

        {fields.length === 0 ? (
          <div className="border-2 border-dashed border-border-subtle rounded-2xl p-8 text-center">
            <HelpCircle size={28} className="mx-auto text-muted/50 mb-2" />
            <p className="text-sm text-muted">
              No custom questions yet. Students will only provide their basic
              details.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((field, idx) => {
              const Icon =
                FIELD_TYPE_OPTIONS.find((o) => o.value === field.type)?.icon ||
                Type;
              return (
                <div
                  key={field.id}
                  className="border border-border-subtle rounded-2xl p-5 bg-surface-container-low/40 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-surface-container-highest text-on-surface text-xs font-black flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-secondary bg-surface-container-high px-2.5 py-1 rounded-md">
                        <Icon size={12} className="text-primary" />
                        {FIELD_TYPE_OPTIONS.find(
                          (o) => o.value === field.type
                        )?.label || "Text"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeField(field.id)}
                      className="p-1.5 text-muted hover:text-red-600 transition-colors"
                      title="Delete question"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-1">
                        Question Label *
                      </label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) =>
                          updateField(field.id, { label: e.target.value })
                        }
                        placeholder="e.g. Why do you want to join?"
                        className="w-full px-3.5 py-2 rounded-xl border border-border-subtle focus:border-primary outline-none text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-1">
                        Answer Type
                      </label>
                      <select
                        value={field.type}
                        onChange={(e) =>
                          updateField(field.id, {
                            type: e.target.value as ClubJoiningField["type"],
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-border-subtle focus:border-primary outline-none text-sm bg-white"
                      >
                        {FIELD_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {(field.type === "select" ||
                    field.type === "radio" ||
                    field.type === "checkbox") && (
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-1">
                        Answer Choices (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={(field.options || []).join(", ")}
                        onChange={(e) =>
                          updateField(field.id, {
                            options: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder="Option 1, Option 2, Option 3"
                        className="w-full px-3.5 py-2 rounded-xl border border-border-subtle focus:border-primary outline-none text-sm bg-white"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-border-subtle pt-3">
                    <span className="text-xs text-muted flex items-center gap-1.5">
                      <HelpCircle size={13} className="text-muted/60" />
                      Require students to answer this question
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.isRequired}
                        onChange={(e) =>
                          updateField(field.id, {
                            isRequired: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded text-primary focus:ring-primary border-border-subtle"
                      />
                      <span className="text-xs font-bold text-on-surface">
                        Required
                      </span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={addField}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
        >
          <Plus size={14} />
          Add Question
        </button>
      </div>

      {/* Save */}
      <div className="p-6 sm:p-8 flex items-center justify-between bg-surface-container-low/50">
        <p className="text-xs text-muted">
          Students see this form when joining your club, and the WhatsApp link
          right after they apply.
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-container transition-all active:scale-[0.98] shadow-sm disabled:opacity-60"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Form
            </>
          )}
        </button>
      </div>
    </div>
  );
}
