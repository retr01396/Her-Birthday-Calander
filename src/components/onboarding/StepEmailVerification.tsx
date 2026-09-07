"use client";

import { useState } from "react";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Mail,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

interface StepEmailVerificationProps {
  email: string;
  /** True when the parent already holds a verified token for this email. */
  defaultVerified: boolean;
  /** Called after a fresh OTP verify succeeds (stores the single-use token). */
  onVerified: (token: string) => void;
  /** Called when the user clicks Continue from the verified state. */
  onContinue: () => void;
  onBack: () => void;
  onSwitchToSignIn: () => void;
}

export function StepEmailVerification({
  email,
  defaultVerified,
  onVerified,
  onContinue,
  onBack,
  onSwitchToSignIn,
}: StepEmailVerificationProps) {
  const [verified, setVerified] = useState(defaultVerified);
  const [codeSent, setCodeSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState<"sending" | "verifying" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!email.endsWith("@cce.edu.in")) {
      setError("Please use a valid @cce.edu.in email address.");
      return;
    }
    setLoading("sending");
    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "REGISTRATION" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send the verification code.");
        return;
      }
      setCodeSent(true);
      setNotice(
        `A 6-digit code has been sent to ${email}. It expires in 10 minutes.`
      );
    } catch (err: any) {
      setError(err.message || "Failed to send the verification code.");
    } finally {
      setLoading(null);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (otp.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }
    setLoading("verifying");
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, purpose: "REGISTRATION" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid verification code.");
        return;
      }
      setVerified(true);
      setOtp("");
      onVerified(data.actionToken);
    } catch (err: any) {
      setError(err.message || "Verification failed.");
    } finally {
      setLoading(null);
    }
  };

  const handleChangeEmail = () => {
    setError(null);
    setNotice(null);
    setCodeSent(false);
    setOtp("");
    onBack();
  };

  return (
    <div
      className="fixed inset-0 overflow-y-auto bg-[#F8FAFC]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 0%, rgba(60, 123, 255, 0.05) 0%, transparent 70%)",
      }}
    >
      {/* Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-gray-100 px-6 py-4 flex items-center justify-between">
        <a className="text-[#3C7BFF] font-bold text-xl tracking-tight" href="#">
          CampusHub
        </a>
        <nav className="hidden md:flex items-center gap-8">
          <span className="text-[#3C7BFF] font-semibold border-b-2 border-[#3C7BFF] pb-1">
            Onboarding
          </span>
        </nav>
        <div className="flex items-center gap-4">
          <button
            onClick={onSwitchToSignIn}
            className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            Sign In Instead
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-6 md:p-10 z-10 w-full max-w-4xl mx-auto pt-32 pb-20 min-h-screen">
        <div className="w-full max-w-2xl">
          {/* Progress Indicator */}
          <div className="mb-8 flex items-center justify-center space-x-2 text-sm font-semibold">
            <span className="text-[#3C7BFF] bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 shadow-sm">
              1. Academic Details
            </span>
            <span className="text-gray-400">→</span>
            <span className="text-[#3C7BFF] bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 shadow-sm">
              2. Verify Email
            </span>
            <span className="text-gray-400">→</span>
            <span className="text-gray-500">3. Club Selection</span>
          </div>

          {/* Header text */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1E293B] tracking-tight leading-tight mb-4">
              Verify your email
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-medium">
              We'll send a 6-digit code to your institutional email to confirm
              it belongs to you.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 md:p-8 relative">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}
            {notice && (
              <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
                <CheckCircle2 size={20} className="text-[#3C7BFF] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#1E293B] font-medium">{notice}</p>
              </div>
            )}

            {/* Email being verified */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-200 mb-6">
              <div className="w-11 h-11 rounded-xl bg-[#3C7BFF]/10 flex items-center justify-center flex-shrink-0">
                <Mail size={20} className="text-[#3C7BFF]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Verifying address
                </p>
                <p className="text-sm font-bold text-[#1E293B] truncate">{email}</p>
              </div>
              {verified && (
                <span className="ml-auto flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 border border-green-200 rounded-full px-3 py-1.5 flex-shrink-0">
                  <CheckCircle2 size={14} /> Verified
                </span>
              )}
            </div>

            {verified ? (
              /* ── Verified state ── */
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
                  <ShieldCheck size={32} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-extrabold text-[#1E293B] mb-2">
                  Email verified!
                </h2>
                <p className="text-gray-600 font-medium mb-8">
                  Your @cce.edu.in address is confirmed. Now pick the clubs and
                  professional bodies you'd like to join.
                </p>
                <button
                  onClick={onContinue}
                  className="w-full md:w-auto px-8 py-3.5 bg-[#3C7BFF] text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 hover:bg-blue-600"
                >
                  Continue to Club Selection
                  <ArrowRight size={18} />
                </button>
              </div>
            ) : codeSent ? (
              /* ── Verify state ── */
              <form className="space-y-6" onSubmit={handleVerify}>
                <div>
                  <label
                    className="block text-sm font-semibold text-[#1E293B] mb-2"
                    htmlFor="otp"
                  >
                    6-Digit Verification Code
                  </label>
                  <input
                    className="w-full bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono text-[#1E293B] focus:bg-white focus:ring-2 focus:ring-[#3C7BFF] focus:border-transparent outline-none transition-all shadow-sm placeholder-gray-400 font-bold"
                    id="otp"
                    name="otp"
                    placeholder="123456"
                    required
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-3 pt-2">
                  <button
                    className="flex-1 px-8 py-3.5 bg-[#3C7BFF] text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={loading === "verifying"}
                  >
                    {loading === "verifying" ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Verifying…
                      </>
                    ) : (
                      <>
                        Verify Email
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                  <button
                    className="px-6 py-3.5 rounded-full bg-white text-gray-700 font-semibold text-sm border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    type="button"
                    disabled={loading !== null}
                    onClick={() => {
                      setError(null);
                      setNotice(null);
                      setLoading("sending");
                      fetch("/api/auth/otp/request", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          email,
                          purpose: "REGISTRATION",
                        }),
                      })
                        .then((r) => r.json())
                        .then((data) => {
                          if (!data.success && data.error) setError(data.error);
                          else setNotice(`A new code has been sent to ${email}.`);
                        })
                        .catch(() =>
                          setError("Failed to resend the verification code.")
                        )
                        .finally(() => setLoading(null));
                    }}
                  >
                    {loading === "sending" ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      "Resend Code"
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleChangeEmail}
                  className="w-full text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft size={14} />
                  Use a different email
                </button>
              </form>
            ) : (
              /* ── Request state ── */
              <form className="space-y-6" onSubmit={handleSendCode}>
                <p className="text-gray-600 font-medium text-sm leading-relaxed">
                  A one-time code will be sent to <strong>{email}</strong>. You
                  must verify this address before your account can be created —
                  this confirms you're a student of the institution.
                </p>

                <div className="flex flex-col md:flex-row gap-3 pt-2">
                  <button
                    className="flex-1 px-8 py-3.5 bg-[#3C7BFF] text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={loading === "sending"}
                  >
                    {loading === "sending" ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Sending code…
                      </>
                    ) : (
                      <>
                        Send Verification Code
                        <Mail size={18} />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleChangeEmail}
                    className="px-6 py-3.5 rounded-full bg-white text-gray-700 font-semibold text-sm border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ArrowLeft size={16} />
                    Change Email
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="mt-8 flex justify-center items-center gap-4 text-sm text-gray-500 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-[#3C7BFF]" />
              Protected
            </span>
            <span>•</span>
            <span>University Verified</span>
          </div>
        </div>
      </main>
    </div>
  );
}
