"use client";

import React, { useState, FormEvent } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
} from "lucide-react";

type Step = "REQUEST" | "VERIFY" | "NEW_PASSWORD";

interface ChangePasswordCardProps {
  /** The signed-in club's username — the identifier OTPs are sent to. */
  clubUsername: string;
}

/**
 * Club lead password change with OTP authorization (CHANGE_PASSWORD purpose).
 * Self-contained so it can be embedded anywhere on the club dashboard.
 */
export function ChangePasswordCard({ clubUsername }: ChangePasswordCardProps) {
  const [step, setStep] = useState<Step>("REQUEST");
  const [otp, setOtp] = useState("");
  const [actionToken, setActionToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setStep("REQUEST");
    setOtp("");
    setActionToken("");
    setNewPassword("");
  };

  const handleRequestOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: clubUsername,
          purpose: "CHANGE_PASSWORD",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send OTP.");
        return;
      }
      setStep("VERIFY");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: clubUsername,
          otp,
          purpose: "CHANGE_PASSWORD",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid OTP.");
        return;
      }
      setActionToken(data.actionToken);
      setStep("NEW_PASSWORD");
    } catch (err: any) {
      setError(err.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: clubUsername,
          purpose: "CHANGE_PASSWORD",
          actionToken,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update password.");
        return;
      }
      setSuccess("Club password updated successfully.");
      resetForm();
    } catch (err: any) {
      setError(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  const stepCopy: Record<Step, { title: string; sub: string }> = {
    REQUEST: {
      title: "Change Club Password",
      sub: `A 6-digit code will be sent to the club account (${clubUsername}).`,
    },
    VERIFY: {
      title: "Enter verification code",
      sub: `We sent a 6-digit code to ${clubUsername}.`,
    },
    NEW_PASSWORD: {
      title: "Set a new password",
      sub: "Code verified — enter your new password (min. 8 characters).",
    },
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md text-body-md placeholder:text-outline-variant bg-white";

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-bold text-on-surface text-base flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primary" />
              Security
            </h2>
            <p className="text-sm text-muted mt-1">
              {stepCopy[step].sub}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-surface-container-low text-secondary border border-border-subtle">
            <ShieldCheck className="w-3 h-3 text-primary" />
            OTP Verified
          </span>
        </div>

        {/* Error / success */}
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

        {/* Step progress */}
        <div className="flex items-center gap-2 mb-6 font-label-caps text-label-caps text-muted">
          {(["REQUEST", "VERIFY", "NEW_PASSWORD"] as Step[]).map((s, i) => (
            <React.Fragment key={s}>
              {i > 0 && <span className="text-outline-variant">→</span>}
              <span
                className={
                  step === s
                    ? "text-primary font-bold"
                    : i < ["REQUEST", "VERIFY", "NEW_PASSWORD"].indexOf(step)
                    ? "text-secondary"
                    : ""
                }
              >
                {s === "REQUEST"
                  ? "1. Request"
                  : s === "VERIFY"
                  ? "2. Verify"
                  : "3. Update"}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* STEP 1: REQUEST */}
        {step === "REQUEST" && (
          <form className="space-y-4" onSubmit={handleRequestOtp}>
            <p className="text-sm text-muted">
              You&apos;ll receive a one-time code before the password can be
              changed. This protects the club account from unauthorized access.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-headline-sm text-headline-sm hover:bg-on-primary-fixed-variant transition-all active:scale-[0.98] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending code…
                </>
              ) : (
                "Send OTP Code"
              )}
            </button>
          </form>
        )}

        {/* STEP 2: VERIFY */}
        {step === "VERIFY" && (
          <form className="space-y-4" onSubmit={handleVerifyOtp}>
            <label className="font-label-caps text-label-caps text-secondary block">
              6-Digit Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              required
              className={`${inputClass} text-center text-lg tracking-widest font-mono`}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-headline-sm text-headline-sm hover:bg-on-primary-fixed-variant transition-all active:scale-[0.98] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verifying…
                </>
              ) : (
                "Verify OTP"
              )}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="w-full text-sm text-muted hover:text-primary transition-colors"
            >
              ← Cancel
            </button>
          </form>
        )}

        {/* STEP 3: NEW PASSWORD */}
        {step === "NEW_PASSWORD" && (
          <form className="space-y-4" onSubmit={handleChangePassword}>
            <label className="font-label-caps text-label-caps text-secondary block">
              New Password
            </label>
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                autoComplete="new-password"
                minLength={8}
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-on-surface transition-colors"
              >
                {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-headline-sm text-headline-sm hover:bg-on-primary-fixed-variant transition-all active:scale-[0.98] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Updating…
                </>
              ) : (
                "Update Club Password"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
