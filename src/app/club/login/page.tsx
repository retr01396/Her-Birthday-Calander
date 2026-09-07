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
  ShieldCheck,
  Building2,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

function ClubLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetDone = searchParams.get("reset") === "1";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClubLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid club username or password.");
        return;
      }

      // Unpublished clubs are redirected to the setup wizard by middleware.
      router.push("/club/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(
        err.message || "An unexpected error occurred during club login."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] bg-surface rounded-2xl shadow-sm border border-border-subtle overflow-hidden">
        <div className="p-8">
          {/* Brand Identity */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center rotate-[12deg] shadow-sm">
              <Building2 size={22} className="text-white" />
            </div>
            <span className="font-headline-sm text-headline-sm font-black tracking-tighter text-on-surface">
              campushub
            </span>
          </div>

          {/* Provisioned Account Note */}
          <div className="mb-8 p-3.5 rounded-xl bg-surface-container-low border border-border-subtle flex items-start gap-3 text-muted text-[13px] leading-snug">
            <ShieldCheck
              size={18}
              className="flex-shrink-0 mt-0.5 text-primary"
            />
            <span>
              Club accounts are provisioned and managed by CampusHub
              administrators. Use the username and password shared with your
              club lead.
            </span>
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
                Club Representative Portal
              </h1>
              <p className="font-body-md text-body-md text-muted mt-1">
                Manage your club profile, events, scanner, and leaderboard
                points.
              </p>
            </header>

            <form className="space-y-5" onSubmit={handleClubLogin}>
              {/* Club Username */}
              <div className="space-y-1.5">
                <label className="font-label-caps text-label-caps text-secondary block">
                  Club Username
                </label>
                <input
                  type="text"
                  autoComplete="username"
                  placeholder="e.g. ieee, acm, gdsc"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md text-body-md placeholder:text-outline-variant"
                />
                <p className="font-body-md text-[12px] text-muted leading-tight flex items-start gap-1.5">
                  <Info
                    size={14}
                    className="flex-shrink-0 mt-0.5 text-secondary"
                  />
                  <span>
                    New clubs start in a draft state — after signing in you&apos;ll
                    be guided through publishing your club profile.
                  </span>
                </p>
              </div>

              {/* Club Password */}
              <div className="space-y-1.5">
                <label className="font-label-caps text-label-caps text-secondary block">
                  Club Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md text-body-md placeholder:text-outline-variant pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-on-surface transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="flex justify-end">
                  <Link
                    href="/forgot-password?type=club"
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
                  "Sign In as Club"
                )}
              </button>
            </form>

            {/* Footer */}
            <footer className="mt-8 pt-6 border-t border-border-subtle text-center">
              <p className="font-body-md text-[12px] text-muted flex items-center justify-center gap-1.5">
                <GraduationCap
                  size={14}
                  className="flex-shrink-0 text-secondary"
                />
                <span>
                  Are you a Student or Admin?{" "}
                  <Link
                    href="/login"
                    className="text-primary font-bold hover:underline inline-flex items-center gap-0.5"
                  >
                    Login here
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

export default function ClubLoginPage() {
  return (
    <Suspense fallback={null}>
      <ClubLoginForm />
    </Suspense>
  );
}
