"use client";

import { useState, FormEvent } from "react";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Mail,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

interface ClubEmailCardProps {
  /** The club's current verified email (null when not set yet). */
  clubEmail: string | null;
  clubUsername: string;
}

type FlowStep =
  | "IDLE"
  | "VERIFY_OLD"
  | "VERIFY_NEW"
  | "NEW_VERIFIED"
  | "DONE";

/**
 * Shows the club's official email and lets the lead change it — the OLD
 * address and the NEW address must each be OTP-verified first.
 */
export function ClubEmailCard({ clubEmail, clubUsername }: ClubEmailCardProps) {
  const hasEmail = Boolean(clubEmail);
  const [step, setStep] = useState<FlowStep>("IDLE");

  const [oldOtpSent, setOldOtpSent] = useState(false);
  const [oldOtp, setOldOtp] = useState("");
  const [oldToken, setOldToken] = useState("");

  const [newEmail, setNewEmail] = useState("");
  const [newOtpSent, setNewOtpSent] = useState(false);
  const [newOtp, setNewOtp] = useState("");
  const [newToken, setNewToken] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const reset = () => {
    setStep("IDLE");
    setOldOtpSent(false);
    setOldOtp("");
    setOldToken("");
    setNewEmail("");
    setNewOtpSent(false);
    setNewOtp("");
    setNewToken("");
    setError(null);
  };

  const sendOtp = async (target: string) => {
    const res = await fetch("/api/auth/otp/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: target, purpose: "EMAIL_VERIFICATION" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to send the code.");
  };

  const verifyOtp = async (target: string, otp: string) => {
    const res = await fetch("/api/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: target,
        otp,
        purpose: "EMAIL_VERIFICATION",
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Invalid verification code.");
    return data.actionToken as string;
  };

  // Step A: send/verify the OTP for the CURRENT email.
  const handleSendOldOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await sendOtp(clubEmail!);
      setOldOtpSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send the code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOldOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = await verifyOtp(clubEmail!, oldOtp);
      setOldToken(token);
      setStep("VERIFY_NEW");
    } catch (err: any) {
      setError(err.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // Step B: send/verify the OTP for the NEW email (also used when the club has
  // no email yet — only the new address is verified then).
  const handleSendNewOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const target = newEmail.trim().toLowerCase();
    if (!target) {
      setError("Enter the new email address first.");
      return;
    }
    setLoading(true);
    try {
      await sendOtp(target);
      setNewOtpSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send the code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyNewOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = await verifyOtp(newEmail.trim().toLowerCase(), newOtp);
      setNewToken(token);
      setStep("NEW_VERIFIED");
    } catch (err: any) {
      setError(err.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/club/update-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(hasEmail ? { oldEmail: clubEmail } : {}),
          ...(hasEmail ? { oldToken } : {}),
          newEmail: newEmail.trim().toLowerCase(),
          newToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update the club email.");
        return;
      }
      setSuccess(
        hasEmail
          ? `Club email updated to ${data.email}.`
          : `Club email set to ${data.email}.`
      );
      setStep("DONE");
      setTimeout(() => window.location.reload(), 1400);
    } catch (err: any) {
      setError(err.message || "Failed to update the club email.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md text-body-md placeholder:text-outline-variant bg-white";
  const otpInputClass = `${inputClass} text-center text-lg tracking-widest font-mono`;
  const primaryBtnClass =
    "w-full bg-primary text-on-primary py-3 rounded-xl font-headline-sm text-headline-sm hover:bg-on-primary-fixed-variant transition-all active:scale-[0.98] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  const ghostBtnClass =
    "sm:w-auto w-full px-5 py-3 rounded-xl bg-surface-container-low border border-border-subtle text-sm font-bold text-primary hover:bg-surface-container-high transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0";

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-bold text-on-surface text-base flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              Club Email
            </h2>
            <p className="text-sm text-muted mt-1">
              {hasEmail
                ? "Changing the address requires verifying the current email and the new email."
                : "Set the official email for this club — it must be OTP-verified."}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-surface-container-low text-secondary border border-border-subtle">
            <ShieldCheck className="w-3 h-3 text-primary" />
            OTP Verified
          </span>
        </div>

        {/* Current email */}
        {hasEmail && step === "IDLE" && (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low/60 border border-border-subtle px-4 py-3 mb-6">
            <div className="flex items-center gap-2 text-sm text-on-surface min-w-0">
              <Mail className="w-4 h-4 text-muted shrink-0" />
              <span className="truncate">{clubEmail}</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified
            </span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-error/10 border border-error/20 flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle size={18} className="text-error flex-shrink-0 mt-0.5" />
            <p className="text-[14px] text-error leading-snug">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 animate-in fade-in duration-200">
            <CheckCircle2
              size={18}
              className="text-emerald-600 flex-shrink-0 mt-0.5"
            />
            <p className="text-[14px] text-emerald-700 leading-snug">{success}</p>
          </div>
        )}

        {/* ── IDLE: action button ── */}
        {step === "IDLE" && (
          <button
            type="button"
            onClick={() => setStep(hasEmail ? "VERIFY_OLD" : "VERIFY_NEW")}
            className={primaryBtnClass}
          >
            {hasEmail ? "Change Email" : "Set Club Email"}
            <ArrowRight size={16} />
          </button>
        )}

        {/* ── VERIFY_OLD: verify the current address ── */}
        {step === "VERIFY_OLD" && hasEmail && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Step 1 of 2 — verify you control the current email{" "}
              <strong className="text-on-surface">{clubEmail}</strong>.
            </p>
            {!oldOtpSent ? (
              <button
                type="button"
                onClick={handleSendOldOtp}
                disabled={loading}
                className={primaryBtnClass}
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <ShieldCheck size={18} />
                )}
                Send Code to Current Email
              </button>
            ) : (
              <form className="space-y-4" onSubmit={handleVerifyOldOtp}>
                <label className="font-label-caps text-label-caps text-secondary block">
                  6-Digit Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={oldOtp}
                  onChange={(e) => setOldOtp(e.target.value.replace(/\D/g, ""))}
                  required
                  className={otpInputClass}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className={primaryBtnClass}
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  Verify Current Email
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── VERIFY_NEW: enter + verify the new address ── */}
        {step === "VERIFY_NEW" && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              {hasEmail
                ? "Step 2 of 2 —"
                : "Step 1 of 1 —"}{" "}
              verify the new address.
            </p>
            {!newOtpSent ? (
              <form className="space-y-4" onSubmit={handleSendNewOtp}>
                <label className="font-label-caps text-label-caps text-secondary block">
                  New Club Email
                </label>
                <input
                  type="email"
                  placeholder="newclub@cce.edu.in"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                    setNewOtpSent(false);
                  }}
                  required
                  className={inputClass}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className={primaryBtnClass}
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <ShieldCheck size={18} />
                  )}
                  Send Code to New Email
                </button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleVerifyNewOtp}>
                <label className="font-label-caps text-label-caps text-secondary block">
                  Enter the 6-digit code sent to{" "}
                  <span className="text-on-surface">
                    {newEmail.trim().toLowerCase()}
                  </span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={newOtp}
                  onChange={(e) => setNewOtp(e.target.value.replace(/\D/g, ""))}
                  required
                  className={otpInputClass}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className={primaryBtnClass}
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  Verify New Email
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── NEW_VERIFIED: both done → save ── */}
        {step === "NEW_VERIFIED" && (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-700 flex items-start gap-2.5">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
              <span>
                Both addresses verified. Update the club email to{" "}
                <strong>{newEmail.trim().toLowerCase()}</strong>?
              </span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={primaryBtnClass}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ArrowRight size={16} />
              )}
              Update Club Email
            </button>
            <button
              type="button"
              onClick={reset}
              className="w-full text-sm text-muted hover:text-primary transition-colors"
            >
              ← Cancel
            </button>
          </form>
        )}

        {/* Footer hint */}
        {(step === "VERIFY_OLD" || step === "VERIFY_NEW") && (
          <button
            type="button"
            onClick={reset}
            className="w-full text-sm text-muted hover:text-primary transition-colors mt-4"
          >
            ← Cancel
          </button>
        )}
      </div>
    </div>
  );
}
