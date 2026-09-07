"use client";

import React, { Suspense, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Info,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Zap,
  Building2,
  ArrowRight,
} from "lucide-react";
import { RegistrationFlow } from "@/components/onboarding/RegistrationFlow";

type AuthTab = "signin" | "register";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const resetDone = searchParams.get("reset") === "1";

  const [tab, setTab] = useState<AuthTab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error ||
            "Invalid credentials. Please verify your email and password."
        );
        return;
      }

      // The sign-in endpoint sets the session cookie; load the full profile to
      // decide where to send the user (role + onboarding state).
      const meRes = await fetch("/api/auth/me");
      const me = await meRes.json().catch(() => null);
      const role = me?.user?.role ?? data?.user?.role;

      if (role === "SUPER_ADMIN") {
        router.push("/admin");
      } else if (role === "CLUB") {
        // Unpublished clubs are redirected to /club/setup by middleware.
        router.push("/club/dashboard");
      } else if (me?.user?.onboardingCompleted === false) {
        router.push("/onboarding");
      } else {
        const safe =
          callbackUrl &&
          callbackUrl.startsWith("/") &&
          callbackUrl !== "/login"
            ? callbackUrl
            : "/";
        router.push(safe);
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  // Registration reuses the shared onboarding flow, so student onboarding
  // (profile details → club selection) works exactly as it did on the home page.
  if (tab === "register") {
    return (
      <RegistrationFlow
        onSuccess={() => {
          router.push("/");
          router.refresh();
        }}
        onSwitchToSignIn={() => {
          setTab("signin");
          setError(null);
        }}
      />
    );
  }

  // After the early return above, `tab` is narrowed to "signin" for the rest
  // of this render — derive the active-tab styles from a boolean instead of
  // comparing against the narrowed literal.
  const isSigninTab = tab === "signin";

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

          {/* ── Mode Switcher ── */}
          <div className="flex bg-surface-container-low p-1 rounded-xl border border-border-subtle mb-8">
            <button
              type="button"
              onClick={() => {
                setTab("signin");
                setError(null);
              }}
              className={`flex-1 py-2.5 text-sm font-headline-sm rounded-lg transition-all ${
                isSigninTab
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-secondary hover:text-on-surface"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("register");
                setError(null);
              }}
              className={`flex-1 py-2.5 text-sm font-headline-sm rounded-lg transition-all ${
                !isSigninTab
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-secondary hover:text-on-surface"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* ── Password reset success ── */}
          {resetDone && !error && (
            <div className="mb-6 p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2
                size={18}
                className="text-primary flex-shrink-0 mt-0.5"
              />
              <p className="text-[14px] text-on-surface leading-snug">
                Password updated successfully — sign in with your new password.
              </p>
            </div>
          )}

          {/* ── Global Error ── */}
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-error/10 border border-error/20 flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle
                size={18}
                className="text-error flex-shrink-0 mt-0.5"
              />
              <p className="text-[14px] text-error leading-snug">{error}</p>
            </div>
          )}

          {/* ── Sign In ── */}
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <header className="mb-6">
              <h1 className="font-headline-md text-headline-md text-on-surface">
                Welcome back
              </h1>
              <p className="font-body-md text-body-md text-muted mt-1">
                Sign in with your campus email to access events, clubs, and
                passes.
              </p>
            </header>

            <form className="space-y-5" onSubmit={handleSignIn}>
              {/* Email */}
              <div className="space-y-1.5">
                <label className="font-label-caps text-label-caps text-secondary block">
                  Campus Email
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="student@cce.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md text-body-md placeholder:text-outline-variant"
                />
                <p className="font-body-md text-[12px] text-muted leading-tight flex items-start gap-1.5">
                  <Info
                    size={14}
                    className="flex-shrink-0 mt-0.5 text-secondary"
                  />
                  <span>
                    Club representatives sign in with their club username on
                    the{" "}
                    <Link
                      href="/club/login"
                      className="text-primary font-bold hover:underline"
                    >
                      club login page
                    </Link>
                    .
                  </span>
                </p>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="font-label-caps text-label-caps text-secondary block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md text-body-md placeholder:text-outline-variant pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-on-surface transition-colors"
                  >
                    {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="font-body-md text-[12px] text-primary font-bold hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-headline-sm text-headline-sm hover:bg-on-primary-fixed-variant transition-all active:scale-[0.98] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign In to Dashboard"
                )}
              </button>
            </form>

            {/* Footer */}
            <footer className="mt-8 pt-6 border-t border-border-subtle text-center">
              <p className="font-body-md text-body-md text-secondary">
                New to CampusHub?{" "}
                <button
                  onClick={() => {
                    setTab("register");
                    setError(null);
                  }}
                  className="text-primary font-bold hover:underline"
                >
                  Create an account
                </button>
              </p>
              <p className="font-body-md text-[12px] text-muted mt-4 flex items-center justify-center gap-1.5">
                <Building2
                  size={14}
                  className="flex-shrink-0 text-secondary"
                />
                <span>
                  Are you a club account?{" "}
                  <Link
                    href="/club/login"
                    className="text-primary font-bold hover:underline inline-flex items-center gap-0.5"
                  >
                    Club login
                    <ArrowRight size={12} />
                  </Link>
                </span>
              </p>
            </footer>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
