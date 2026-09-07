"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  Loader2,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  ArrowRight,
  AlertCircle,
  User,
  Hash,
  Phone,
  Building2,
} from "lucide-react";
import ImageUploader from "@/components/media/ImageUploader";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ClubJoiningField {
  id: string;
  label: string;
  type: "text" | "textarea" | "url" | "select" | "radio" | "checkbox" | "image";
  placeholder?: string;
  helpText?: string;
  options?: string[];
  isRequired: boolean;
}

export interface ClubJoiningFlowClub {
  id: string;
  name: string;
  logoUrl?: string | null;
  tagline?: string | null;
  customFormFields?: ClubJoiningField[] | null;
  whatsappGroupUrl?: string | null;
}

interface ClubJoiningFlowProps {
  club: ClubJoiningFlowClub;
  isOpen: boolean;
  onClose: () => void;
  /** Auto-fill for the default profile fields (e.g. the student's name). */
  prefill?: { name?: string; rollNumber?: string; phone?: string };
  /**
   * Persists the answers and returns the club's WhatsApp link.
   * During onboarding this stores answers locally (they are saved to the DB
   * at registration); for logged-in users it calls the apply server action.
   */
  onSubmitApplication: (
    answers: Record<string, string | string[]>
  ) => Promise<{ whatsappGroupUrl?: string | null }>;
  /** Called when the student finishes and returns (club is now marked selected). */
  onSuccess: (clubId: string, answers: Record<string, string | string[]>) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ClubJoiningFlow({
  club,
  isOpen,
  onClose,
  prefill,
  onSubmitApplication,
  onSuccess,
}: ClubJoiningFlowProps) {
  const [step, setStep] = useState<"FORM" | "WHATSAPP">("FORM");
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fields = useMemo(() => {
    const defaults: ClubJoiningField[] = [
      {
        id: "fullName",
        label: "Full Name",
        type: "text",
        placeholder: "Your full name",
        isRequired: true,
      },
      {
        id: "rollNumber",
        label: "Roll Number",
        type: "text",
        placeholder: "e.g. 21CS045",
        isRequired: true,
      },
      {
        id: "phone",
        label: "Phone Number",
        type: "text",
        placeholder: "e.g. 98765 43210",
        isRequired: true,
      },
    ];
    const custom = (club?.customFormFields || []).filter(
      (f) => f && f.id && f.label
    );
    return [...defaults, ...custom];
  }, [club?.customFormFields]);

  // Reset state whenever the modal opens (or the club changes).
  useEffect(() => {
    if (isOpen) {
      setStep("FORM");
      setAnswers({
        ...(prefill?.name ? { fullName: prefill.name } : {}),
        ...(prefill?.rollNumber ? { rollNumber: prefill.rollNumber } : {}),
        ...(prefill?.phone ? { phone: prefill.phone } : {}),
      });
      setValidationErrors({});
      setSubmitError(null);
      setWhatsappUrl(null);
      setCopied(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, club?.id]);

  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (!isOpen) {
      document.body.style.overflow = previousOverflow;
      return;
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleInputChange = (fieldId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    if (validationErrors[fieldId]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const toggleCheckboxOption = (fieldId: string, option: string) => {
    const current = (answers[fieldId] as string[]) || [];
    const next = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    handleInputChange(fieldId, next);
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    for (const field of fields) {
      if (!field.isRequired) continue;
      const val = answers[field.id];
      if (
        val === undefined ||
        val === null ||
        val === "" ||
        (Array.isArray(val) && val.length === 0)
      ) {
        errors[field.id] = `"${field.label}" is required.`;
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await onSubmitApplication(answers);
      setWhatsappUrl(result.whatsappGroupUrl ?? club.whatsappGroupUrl ?? null);
      setStep("WHATSAPP");
    } catch (err: any) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to submit application."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = async () => {
    if (!whatsappUrl) return;
    try {
      await navigator.clipboard.writeText(whatsappUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  const handleFinish = () => {
    onSuccess(club.id, answers);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="pointer-events-auto w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200 max-h-[90vh] flex flex-col">
          {step === "FORM" ? (
            /* ════════ STEP 1: MEMBERSHIP APPLICATION FORM ════════ */
            <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-6 pb-5 border-b border-gray-100 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                    {club.logoUrl ? (
                      <img
                        src={club.logoUrl}
                        alt={`${club.name} logo`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 size={22} className="text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#3C7BFF] bg-[#3C7BFF]/10 px-2.5 py-0.5 rounded-full inline-block">
                      Membership Application
                    </span>
                    <h2 className="text-lg font-bold text-gray-900 leading-tight mt-1.5 truncate">
                      Join {club.name}
                    </h2>
                    {club.tagline && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {club.tagline}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Fields */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {submitError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2 animate-in fade-in duration-200">
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                {fields.map((field) => {
                  const hasError = !!validationErrors[field.id];
                  const value = answers[field.id] as string | undefined;
                  return (
                    <div key={field.id} className="space-y-1.5">
                      <label className="block text-xs font-semibold text-gray-800">
                        {field.label}{" "}
                        {field.isRequired ? (
                          <span className="text-red-500">*</span>
                        ) : (
                          <span className="text-gray-400 font-normal text-[11px]">
                            (Optional)
                          </span>
                        )}
                      </label>
                      {field.helpText && (
                        <p className="text-[11px] text-gray-500 -mt-0.5">
                          {field.helpText}
                        </p>
                      )}

                      {field.type === "textarea" ? (
                        <textarea
                          rows={3}
                          value={value || ""}
                          onChange={(e) =>
                            handleInputChange(field.id, e.target.value)
                          }
                          placeholder={field.placeholder || "Type your answer..."}
                          className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all bg-white ${
                            hasError
                              ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
                              : "border-gray-200 focus:border-[#3C7BFF] focus:ring-2 focus:ring-[#3C7BFF]/15"
                          }`}
                        />
                      ) : field.type === "image" ? (
                        <div
                          className={`rounded-xl transition-all ${
                            hasError ? "ring-2 ring-red-400/30" : ""
                          }`}
                        >
                          <ImageUploader
                            value={(value as string) || ""}
                            onUploadSuccess={(url) =>
                              handleInputChange(field.id, url)
                            }
                            buttonLabel="Upload Image"
                            hint="Attach a relevant image (JPG, PNG, WebP)."
                          />
                        </div>
                      ) : field.type === "select" ? (
                        <select
                          value={value || ""}
                          onChange={(e) =>
                            handleInputChange(field.id, e.target.value)
                          }
                          className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all bg-white ${
                            hasError
                              ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
                              : "border-gray-200 focus:border-[#3C7BFF] focus:ring-2 focus:ring-[#3C7BFF]/15"
                          }`}
                        >
                          <option value="">-- Choose an Option --</option>
                          {field.options?.map((opt, i) => (
                            <option key={i} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : field.type === "radio" ? (
                        <div className="space-y-2 pt-0.5">
                          {field.options?.map((opt, i) => (
                            <label
                              key={i}
                              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              <input
                                type="radio"
                                name={field.id}
                                checked={value === opt}
                                onChange={() => handleInputChange(field.id, opt)}
                                className="w-4 h-4 text-[#3C7BFF] focus:ring-[#3C7BFF] border-gray-300"
                              />
                              <span className="text-sm text-gray-700">{opt}</span>
                            </label>
                          ))}
                        </div>
                      ) : field.type === "checkbox" ? (
                        <div className="space-y-2 pt-0.5">
                          {field.options?.map((opt, i) => {
                            const selected = (answers[field.id] as string[]) || [];
                            return (
                              <label
                                key={i}
                                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={selected.includes(opt)}
                                  onChange={() =>
                                    toggleCheckboxOption(field.id, opt)
                                  }
                                  className="w-4 h-4 rounded text-[#3C7BFF] focus:ring-[#3C7BFF] border-gray-300"
                                />
                                <span className="text-sm text-gray-700">{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <input
                          type={field.type === "url" ? "url" : "text"}
                          value={value || ""}
                          onChange={(e) =>
                            handleInputChange(field.id, e.target.value)
                          }
                          placeholder={
                            field.placeholder ||
                            (field.type === "url" ? "https://..." : "Your response")
                          }
                          className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all bg-white ${
                            hasError
                              ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
                              : "border-gray-200 focus:border-[#3C7BFF] focus:ring-2 focus:ring-[#3C7BFF]/15"
                          }`}
                        />
                      )}

                      {hasError && (
                        <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
                          <AlertCircle size={11} />
                          {validationErrors[field.id]}
                        </p>
                      )}
                    </div>
                  );
                })}

                {fields.length === 0 && (
                  <p className="text-sm text-gray-500 py-2">
                    No additional questions required. Click below to register your
                    membership!
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 max-w-[220px] px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#3C7BFF] hover:bg-blue-600 transition-all active:scale-[0.98] shadow-sm disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* ════════ STEP 2: SUCCESS + WHATSAPP GROUP LINK ════════ */
            <div className="p-8 text-center space-y-5 overflow-y-auto">
              {/* Success icon */}
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 animate-in zoom-in-95 duration-300">
                <Sparkles size={30} />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full inline-block">
                  Application Submitted
                </span>
                <h2 className="text-2xl font-black text-gray-900 mt-3">
                  You&apos;re almost there, {club.name} awaits! 🎉
                </h2>
                <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
                  Join the official WhatsApp group for{" "}
                  <strong className="text-gray-800">{club.name}</strong> to stay
                  updated on recruitments, events, and announcements.
                </p>
              </div>

              {whatsappUrl ? (
                <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-200 text-left">
                  <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-gray-200">
                    <span className="text-xs font-mono truncate text-gray-500">
                      {whatsappUrl}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
                    >
                      {copied ? (
                        <>
                          <Check size={14} className="text-emerald-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-bold text-white bg-[#25D366] hover:bg-[#1DA851] transition-all active:scale-[0.98] shadow-sm"
                  >
                    <MessageCircle size={16} />
                    Join WhatsApp Group
                    <ExternalLink size={13} className="opacity-80" />
                  </a>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <p className="text-xs text-gray-500 italic">
                    No WhatsApp group link has been set for this club yet. You can
                    proceed directly — the leader will reach out soon.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleFinish}
                className="w-full px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-[#3C7BFF] hover:bg-blue-600 transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
              >
                Continue Onboarding
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
