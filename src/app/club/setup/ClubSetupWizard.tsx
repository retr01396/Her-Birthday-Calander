"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CropImageUploader from "@/components/media/CropImageUploader";
import type { ClubJoiningField } from "@/components/ClubJoiningFlow";
import {
  Lock,
  Palette,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  MessageCircle,
  ClipboardList,
  Mail,
  ShieldCheck,
} from "lucide-react";

// ─── Color presets for auto-generated branding ──────────────────────────────

const COLOR_PRESETS = [
  { name: "Soft Slate", bg: "#F1F5F9", text: "#475569" },
  { name: "Pastel Emerald", bg: "#E6F4EA", text: "#137333" },
  { name: "Pastel Indigo", bg: "#E8EAF6", text: "#283593" },
  { name: "Warm Amber", bg: "#FEF3C7", text: "#92400E" },
  { name: "Soft Rose", bg: "#FFE4E6", text: "#9F1239" },
] as const;

type Preset = (typeof COLOR_PRESETS)[number];

const FIELD_TYPE_OPTIONS: { value: ClubJoiningField["type"]; label: string }[] =
  [
    { value: "text", label: "Short Answer" },
    { value: "textarea", label: "Paragraph" },
    { value: "url", label: "Link / URL" },
    { value: "select", label: "Dropdown" },
    { value: "radio", label: "Multiple Choice" },
    { value: "checkbox", label: "Checkboxes" },
  ];

// ─── SVG preset generators ──────────────────────────────────────────────────

function generatePresetLogo(preset: Preset, clubName: string): string {
  const char = (clubName || "C").charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" fill="${preset.bg}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="260" font-weight="bold" fill="${preset.text}">${char}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function generatePresetBanner(preset: Preset, clubName: string): string {
  const char = (clubName || "C").charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400" viewBox="0 0 1200 400"><rect width="1200" height="400" fill="${preset.bg}"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="200" font-weight="bold" fill="${preset.text}" opacity="0.14">${char}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface SetupClub {
  id: string;
  name: string;
  username: string;
  email: string | null;
  emailVerifiedAt: Date | null;
  tagline: string | null;
  description: string;
  about: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  whatsappGroupUrl: string | null;
  customFormFields: unknown;
  status: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ClubSetupWizard({ club }: { club: SetupClub }) {
  const router = useRouter();
  const isSuspended = club.status === "SUSPENDED";

  // ── General info ──
  const [tagline, setTagline] = useState(club.tagline ?? "");
  const [description, setDescription] = useState(club.about ?? club.description);
  const [whatsappUrl, setWhatsappUrl] = useState(club.whatsappGroupUrl ?? "");

  // ── Club email (OTP-verified before publishing) ──
  const [email, setEmail] = useState(club.email ?? "");
  const [emailVerified, setEmailVerified] = useState(
    Boolean(club.email && club.emailVerifiedAt)
  );
  const [emailToken, setEmailToken] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpLoading, setEmailOtpLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // The email must be re-verified whenever it differs from the already
  // verified address on file.
  const emailNeedsVerification =
    !(club.email === email.trim().toLowerCase() && club.emailVerifiedAt);

  // ── Branding ──
  const hasLogo = Boolean(club.logoUrl);
  const hasBanner = Boolean(club.coverUrl);
  const [logoMode, setLogoMode] = useState<"preset" | "upload">(
    hasLogo ? "upload" : "preset"
  );
  const [bannerMode, setBannerMode] = useState<"preset" | "upload">(
    hasBanner ? "upload" : "preset"
  );
  const [selectedColor, setSelectedColor] = useState<Preset>(COLOR_PRESETS[0]);
  const [logoUrl, setLogoUrl] = useState(club.logoUrl ?? "");
  const [bannerUrl, setBannerUrl] = useState(club.coverUrl ?? "");

  // ── Membership form questions ──
  const [formFields, setFormFields] = useState<ClubJoiningField[]>(
    Array.isArray(club.customFormFields)
      ? (club.customFormFields as ClubJoiningField[])
      : []
  );

  // ── Publish state ──
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const char = useMemo(
    () => (club.name || "C").charAt(0).toUpperCase(),
    [club.name]
  );

  const handleSelectPreset = (preset: Preset) => {
    setSelectedColor(preset);
    if (logoMode === "preset") {
      setLogoUrl(generatePresetLogo(preset, club.name));
    }
    if (bannerMode === "preset") {
      setBannerUrl(generatePresetBanner(preset, club.name));
    }
  };

  const switchToPreset = (asset: "logo" | "banner") => {
    if (asset === "logo") {
      setLogoMode("preset");
      setLogoUrl(generatePresetLogo(selectedColor, club.name));
    } else {
      setBannerMode("preset");
      setBannerUrl(generatePresetBanner(selectedColor, club.name));
    }
  };

  const handleUpload = (asset: "logo" | "banner", url: string) => {
    if (asset === "logo") {
      setLogoMode("upload");
      setLogoUrl(url);
    } else {
      setBannerMode("upload");
      setBannerUrl(url);
    }
  };

  // ── Questions editor ──
  const addField = () => {
    setFormFields((prev) => [
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

  const updateField = (id: string, updates: Partial<ClubJoiningField>) => {
    setFormFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const removeField = (id: string) => {
    setFormFields((prev) => prev.filter((f) => f.id !== id));
  };

  // ── Email OTP ──
  const handleSendEmailOtp = async () => {
    setEmailError(null);
    const target = email.trim().toLowerCase();
    if (!target) {
      setEmailError("Enter your official club email first.");
      return;
    }
    setEmailOtpLoading(true);
    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: target, purpose: "EMAIL_VERIFICATION" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEmailError(data.error || "Failed to send the verification code.");
        return;
      }
      setEmailOtpSent(true);
      setEmailOtp("");
    } catch (err) {
      console.error(err);
      setEmailError("Failed to send the verification code.");
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    setEmailError(null);
    const target = email.trim().toLowerCase();
    if (!emailOtp) {
      setEmailError("Enter the 6-digit verification code.");
      return;
    }
    setEmailOtpLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: target,
          otp: emailOtp,
          purpose: "EMAIL_VERIFICATION",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEmailError(data.error || "Invalid verification code.");
        return;
      }
      setEmailToken(data.actionToken);
      setEmailVerified(true);
      setEmailOtpSent(false);
      setEmailOtp("");
    } catch (err) {
      console.error(err);
      setEmailError("Verification failed. Please try again.");
    } finally {
      setEmailOtpLoading(false);
    }
  };

  // ── Publish ──
  const handlePublish = async () => {
    setError(null);

    if (!tagline.trim() || !description.trim()) {
      setError("Please fill in the tagline and club description before publishing.");
      return;
    }
    if (!logoUrl || !bannerUrl) {
      setError("Logo and banner are mandatory — upload images or pick a color preset.");
      return;
    }
    if (!email.trim()) {
      setError("An official club email is required before publishing.");
      return;
    }
    if (emailNeedsVerification && !emailVerified) {
      setError("Verify your club email with the OTP code before publishing.");
      return;
    }

    setIsPublishing(true);
    try {
      const res = await fetch("/api/club/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tagline: tagline.trim(),
          description: description.trim(),
          whatsappGroupUrl: whatsappUrl.trim() || null,
          email: email.trim().toLowerCase(),
          emailVerifiedToken: emailNeedsVerification ? emailToken : null,
          logoUrl,
          bannerUrl,
          customFormFields:
            formFields.length > 0
              ? formFields.map((f) => ({
                  id: f.id,
                  label: f.label,
                  type: f.type,
                  placeholder: f.placeholder ?? null,
                  helpText: f.helpText ?? null,
                  options: f.options ?? null,
                  isRequired: f.isRequired,
                }))
              : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to publish club profile.");
        return;
      }

      // Force a full navigation so the client leaves the setup flow immediately
      // after the backend marks the club as PUBLISHED.
      router.replace("/club/dashboard");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while publishing.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Draft Status Banner ── */}
      <div
        className={`rounded-2xl p-5 flex items-center justify-between gap-4 border ${
          isSuspended
            ? "bg-red-500/10 border-red-500/30"
            : "bg-amber-500/10 border-amber-500/30"
        }`}
      >
        <div className="flex items-center gap-3.5">
          {isSuspended ? (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          ) : (
            <Lock className="w-5 h-5 text-amber-600 flex-shrink-0" />
          )}
          <div>
            <h4
              className={`font-semibold text-sm ${
                isSuspended
                  ? "text-red-900 dark:text-red-200"
                  : "text-amber-900 dark:text-amber-200"
              }`}
            >
              {isSuspended
                ? "Club Account Suspended"
                : "Club Account Pending Publication"}
            </h4>
            <p
              className={`text-xs ${
                isSuspended
                  ? "text-red-700 dark:text-red-400"
                  : "text-amber-700 dark:text-amber-400"
              }`}
            >
              {isSuspended
                ? "This club is suspended. Contact the site administrator."
                : "Complete setup below to publish your page, appear in the club catalog, and start creating events."}
            </p>
          </div>
        </div>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0 ${
            isSuspended
              ? "border-red-500 text-red-600"
              : "border-amber-500 text-amber-600"
          }`}
        >
          {isSuspended ? "Suspended" : "Draft / Unpublished"}
        </span>
      </div>

      {/* ── General Information ── */}
      <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-border-subtle">
          <h2 className="font-bold text-lg text-on-surface mb-1">
            Set Up {club.name}
          </h2>
          <p className="text-sm text-muted">
            Configure your public profile and branding assets — this is what
            students will see in the club catalog.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
              Tagline *
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="A short one-line mission statement"
              className="w-full px-4 py-3 rounded-xl border border-border-subtle focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
              About / Description *
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your club's goals, activities, meeting schedule, and what students can expect..."
              className="w-full px-4 py-3 rounded-xl border border-border-subtle focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
              Official WhatsApp Group Link
            </label>
            <div className="relative">
              <MessageCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
              <input
                type="url"
                value={whatsappUrl}
                onChange={(e) => setWhatsappUrl(e.target.value)}
                placeholder="https://chat.whatsapp.com/..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border-subtle focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm bg-white"
              />
            </div>
            <p className="text-xs text-muted mt-1.5">
              Shown to students right after they apply to join your club.
            </p>
          </div>

          {/* ── Official Club Email (OTP-verified) ── */}
          <div className="border-t border-border-subtle pt-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
              Official Club Email *
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailVerified(false);
                    setEmailToken("");
                    setEmailOtpSent(false);
                    setEmailError(null);
                  }}
                  placeholder="club@cce.edu.in"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-subtle focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm bg-white"
                />
              </div>
              {emailNeedsVerification && !emailVerified && (
                <button
                  type="button"
                  onClick={handleSendEmailOtp}
                  disabled={emailOtpLoading || !email.trim()}
                  className="sm:w-auto w-full px-5 py-3 rounded-xl bg-surface-container-low border border-border-subtle text-sm font-bold text-primary hover:bg-surface-container-high transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0"
                >
                  {emailOtpLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  {emailOtpSent ? "Resend Code" : "Verify Email"}
                </button>
              )}
            </div>

            {emailNeedsVerification ? (
              emailVerified ? (
                <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 mt-2">
                  <CheckCircle className="w-4 h-4" />
                  Email verified — {email.trim().toLowerCase()}
                </p>
              ) : emailOtpSent ? (
                <div className="mt-3 rounded-xl bg-surface-container-low/60 border border-border-subtle p-4 space-y-3">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted">
                    Enter the 6-digit verification code
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={emailOtp}
                      onChange={(e) =>
                        setEmailOtp(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="123456"
                      className="w-full sm:w-40 px-4 py-2.5 rounded-xl border border-border-subtle focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-center tracking-widest font-mono bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyEmailOtp}
                      disabled={emailOtpLoading || emailOtp.length !== 6}
                      className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {emailOtpLoading && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      Verify Code
                    </button>
                  </div>
                  <p className="text-xs text-muted">
                    We sent a 6-digit code to {email.trim().toLowerCase()}. In
                    development it appears in the server console.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted mt-1.5">
                  Used to contact your club. You must verify ownership with an
                  OTP code before publishing.
                </p>
              )
            ) : (
              <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 mt-2">
                <CheckCircle className="w-4 h-4" />
                Verified club email — {email.trim().toLowerCase()}
              </p>
            )}

            {emailError && (
              <p className="text-xs font-medium text-red-600 mt-1.5">
                {emailError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Branding & Media ── */}
      <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-border-subtle">
          <h2 className="font-bold text-base text-on-surface flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            Branding &amp; Media (Mandatory)
          </h2>
          <p className="text-xs text-muted mt-1">
            Your club must have a logo and banner before it can be published.
            Pick a quick light color preset or upload custom images.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* ── Option 1: Color presets ── */}
          <div className="space-y-3">
            <label className="block text-xs font-medium text-muted uppercase tracking-wider">
              Option 1: Quick Light Solid Colors
            </label>
            <div className="flex flex-wrap gap-3">
              {COLOR_PRESETS.map((preset) => {
                const isSelected = selectedColor.name === preset.name;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    title={preset.name}
                    style={{ backgroundColor: preset.bg }}
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? "scale-110 shadow-md"
                        : "opacity-80 hover:opacity-100"
                    }`}
                    aria-label={preset.name}
                  >
                    {isSelected && (
                      <CheckCircle
                        className="w-5 h-5"
                        style={{ color: preset.text }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted">
              Selecting a color generates a minimal logo + banner using your
              club&apos;s initial, <strong>{char}</strong>.
            </p>
          </div>

          {/* ── Preview ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Logo */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-on-surface">Club Logo</p>
                {logoMode === "upload" && (
                  <button
                    type="button"
                    onClick={() => switchToPreset("logo")}
                    className="text-[11px] font-bold text-primary hover:underline"
                  >
                    Use color preset
                  </button>
                )}
              </div>
              <div className="w-24 h-24 rounded-2xl overflow-hidden border border-border-subtle bg-white shadow-sm flex items-center justify-center">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Club logo preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-black text-muted/40">
                    {char}
                  </span>
                )}
              </div>
              <CropImageUploader
                value={logoMode === "upload" ? logoUrl : ""}
                onUploadSuccess={(url) => handleUpload("logo", url)}
                buttonLabel="Upload Custom Logo"
                aspectRatio={1}
                title="Crop Club Logo (1:1 Square)"
                hint="PNG, JPG or WebP (shown on your public page)."
              />
            </div>

            {/* Banner */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-on-surface">Banner</p>
                {bannerMode === "upload" && (
                  <button
                    type="button"
                    onClick={() => switchToPreset("banner")}
                    className="text-[11px] font-bold text-primary hover:underline"
                  >
                    Use color preset
                  </button>
                )}
              </div>
              <div
                className="h-24 rounded-2xl overflow-hidden border border-border-subtle bg-white shadow-sm relative"
                style={
                  bannerUrl
                    ? {
                        backgroundImage: `url(${bannerUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              >
                {!bannerUrl && (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-3xl font-black text-muted/40">
                      {char}
                    </span>
                  </div>
                )}
              </div>
              <CropImageUploader
                value={bannerMode === "upload" ? bannerUrl : ""}
                onUploadSuccess={(url) => handleUpload("banner", url)}
                buttonLabel="Upload Custom Banner"
                aspectRatio={16 / 9}
                title="Crop Club Cover Banner (16:9 Widescreen)"
                hint="PNG, JPG or WebP (wide cover shown on your public page)."
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Membership Form Questions ── */}
      <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-border-subtle">
          <h2 className="font-bold text-base text-on-surface flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" />
            Membership Application Questions
          </h2>
          <p className="text-xs text-muted mt-1">
            Optional. Students will answer these (beyond name, roll number and
            phone) when applying to join your club.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-4">
          {formFields.length === 0 ? (
            <div className="border-2 border-dashed border-border-subtle rounded-2xl p-8 text-center">
              <ClipboardList
                size={28}
                className="mx-auto text-muted/50 mb-2"
              />
              <p className="text-sm text-muted">
                No custom questions yet. Students will only provide their basic
                details.
              </p>
            </div>
          ) : (
            formFields.map((field, idx) => (
              <div
                key={field.id}
                className="border border-border-subtle rounded-2xl p-5 bg-surface-container-low/40 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-surface-container-highest text-on-surface text-xs font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-[11px] font-bold text-secondary bg-surface-container-high px-2.5 py-1 rounded-md">
                      {FIELD_TYPE_OPTIONS.find((o) => o.value === field.type)
                        ?.label || "Text"}
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
                  <span className="text-xs text-muted">
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
            ))
          )}

          <button
            type="button"
            onClick={addField}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
          >
            <Plus size={14} />
            Add Question
          </button>
        </div>
      </div>

      {/* ── Publish CTA ── */}
      <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm p-6 sm:p-8">
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-error/10 border border-error/20 flex items-start gap-2.5 text-sm text-error">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm text-muted">
              Publishing makes your club visible in the{" "}
              <strong className="text-on-surface">public catalog</strong> and
              unlocks event creation, member management and feed posts.
            </p>
          </div>
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing || isSuspended}
            className="w-full sm:w-auto bg-primary text-white font-bold px-8 py-3.5 rounded-xl hover:bg-primary-container transition-all active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing Profile...
              </>
            ) : isSuspended ? (
              "Publishing Disabled"
            ) : (
              <>
                Publish Club Profile 🎉
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
