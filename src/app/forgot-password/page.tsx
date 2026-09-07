"use client";

import React, { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Mail,
  UserCheck,
  KeyRound,
  Zap,
} from "lucide-react";

type AccountType = "student" | "club";
type Step = "REQUEST" | "VERIFY" | "NEW_PASSWORD";

function ForgotPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [type, setType] = useState<AccountType>(
    searchParams.get("type") === "club" ? "club" : "student"
  );
  const [step, setStep] = useState<Step>("REQUEST");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [actionToken, setActionToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loginHref = type === "club" ? "/club/login" : "/login";

  const handleRequestOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: identifier,
          purpose: "FORGOT_PASSWORD",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send OTP.");
        return;
      }
      setNotice(
        data.message ||
          `If ${identifier} is registered, a 6-digit code has been sent.`
      );
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
        body: JSON.stringify({ email: identifier, otp, purpose: "FORGOT_PASSWORD" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid OTP.");
        return;
      }
      setActionToken(data.actionToken);
      setNotice(null);
      setStep("NEW_PASSWORD");
    } catch (err: any) {
      setError(err.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: identifier,
          purpose: "FORGOT_PASSWORD",
          actionToken,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update password.");
        return;
      }
      router.push(`${loginHref}?reset=1`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  const stepCopy: Record<Step, { title: string; sub: string }> = {
    REQUEST: {
      title: "Reset your password",
      sub: `Enter your ${
        type === "club"
          ? "club email or username"
          : "registered campus email"
      } and we'll send a 6-digit code.`,
    },
    VERIFY: {
      title: "Check your inbox",
      sub: `We sent a 6-digit verification code to ${identifier || "your account"}.`,
    },
    NEW_PASSWORD: {
      title: "Choose a new password",
      sub: "Code verified — set your new password (min. 8 characters).",
    },
  };

  return (
    <main className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] bg-surface rounded-2xl shadow-sm border border-border-subtle overflow-hidden">
        <div className="p-8">
          {/* Brand Identity */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center rotate-[12deg] shadow-sm">
              <Zap size={24} className="text-white" fill="currentColor" />
            </div>
            <span className="font-headline-sm text-headline-sm font-black tracking-tighter text-on-surface">
              campushub
            </span>
          </div>

          {/* Account type switcher (only before a code is issued) */}
          {step === "REQUEST" && (
            <div className="flex bg-surface-container-low p-1 rounded-xl border border-border-subtle mb-8">
              <button
                type="button"
                onClick={() => {
                  setType("student");
                  setError(null);
                }}
                className={`flex-1 py-2.5 text-sm font-headline-sm rounded-lg transition-all ${
                  type === "student"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-secondary hover:text-on-surface"
                }`}
              >
                Student / Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setType("club");
                  setError(null);
                }}
                className={`flex-1 py-2.5 text-sm font-headline-sm rounded-lg transition-all ${
                  type === "club"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-secondary hover:text-on-surface"
                }`}
              >
                Club
              </button>
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
                    : "3. New password"}
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* Error / notice */}
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-error/10 border border-error/20 flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle size={18} className="text-error flex-shrink-0 mt-0.5" />
              <p className="text-[14px] text-error leading-snug">{error}</p>
            </div>
          )}
          {notice && (
            <div className="mb-6 p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 size={18} className="text-primary flex-shrink-0 mt-0.5" />
              <p className="text-[14px] text-on-surface leading-snug">{notice}</p>
            </div>
          )}

          <header className="mb-6">
            <h1 className="font-headline-md text-headline-md text-on-surface">
              {stepCopy[step].title}
            </h1>
            <p className="font-body-md text-body-md text-muted mt-1">
              {stepCopy[step].sub}
            </p>
          </header>

          {/* STEP 1: REQUEST */}
          {step === "REQUEST" && (
            <form className="space-y-5" onSubmit={handleRequestOtp}>
              <div className="space-y-1.5">
                <label className="font-label-caps text-label-caps text-secondary block">
                  {type === "club" ? "Club Email or Username" : "Campus Email"}
                </label>
                <div className="relative">
                  {type === "club" ? (
                    <UserCheck
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant"
                    />
                  ) : (
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant"
                    />
                  )}
                  <input
                    type={type === "club" ? "text" : "email"}
                    autoComplete={type === "club" ? "username" : "email"}
                    placeholder={
                      type === "club"
                        ? "club@cce.edu.in or techsociety"
                        : "student@cce.edu.in"
                    }
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md text-body-md placeholder:text-outline-variant"
                  />
                </div>
              </div>

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
                  <>
                    Send OTP Code
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: VERIFY */}
          {step === "VERIFY" && (
            <form className="space-y-5" onSubmit={handleVerifyOtp}>
              <div className="space-y-1.5">
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
                  className="w-full px-4 py-3 rounded-xl border border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md text-body-md text-center text-lg tracking-widest font-mono placeholder:text-outline-variant"
                />
              </div>

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
                onClick={() => setStep("REQUEST")}
                className="w-full text-sm text-muted hover:text-primary transition-colors"
              >
                ← Use a different account
              </button>
            </form>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === "NEW_PASSWORD" && (
            <form className="space-y-5" onSubmit={handleResetPassword}>
              <div className="space-y-1.5">
                <label className="font-label-caps text-label-caps text-secondary block">
                  New Password
                </label>
                <div className="relative">
                  <KeyRound
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant"
                  />
                  <input
                    type={passwordVisible ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={8}
                    placeholder="Minimum 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md text-body-md placeholder:text-outline-variant"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-on-surface transition-colors"
                  >
                    {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
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
                  "Update Password"
                )}
              </button>
            </form>
          )}

          {/* Footer */}
          <footer className="mt-8 pt-6 border-t border-border-subtle text-center">
            <Link
              href={loginHref}
              className="font-body-md text-body-md text-secondary hover:text-primary transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft size={14} />
              Back to {type === "club" ? "club" : "student"} login
            </Link>
          </footer>
        </div>
      </div>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordInner />
    </Suspense>
  );
}
