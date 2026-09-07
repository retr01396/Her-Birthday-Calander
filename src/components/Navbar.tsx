"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Bell, User, Sparkles, Settings } from "lucide-react";

interface NavbarProps {
  userRole: "STUDENT" | "CLUB" | "SUPER_ADMIN" | null;
  userName?: string;
  userEmail?: string;
}

export function Navbar({ userRole, userName, userEmail }: NavbarProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const isClubOrAdmin =
    userRole === "CLUB" || userRole === "SUPER_ADMIN";

  const navLinks = [
    { label: "Dashboard", href: "/" },
    { label: "Feed", href: "/feed" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "Clubs", href: "/clubs" },
  ];

  return (
    <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className={`pointer-events-auto w-full max-w-6xl flex justify-between items-center px-4 sm:px-6 ${scrolled ? "py-2" : "py-3"} bg-[#f6f2e9]/95 backdrop-blur-md rounded-full border-2 border-slate-900 shadow-[3px_3px_0px_0px_#1e293b] transition-all duration-300`}>
        {/* Brand */}
        <Link
          href="/"
          className="text-xl sm:text-2xl font-display italic font-bold text-slate-900 tracking-tight flex items-center gap-2 hover:-translate-y-0.5 transition-transform"
        >
          <span>CampusHub</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-1 font-ui text-xs font-bold uppercase tracking-[.08em]">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`rounded-full px-3 py-2 transition-colors ${
                isActive(link.href)
                  ? "bg-marker-blue text-white shadow-[2px_2px_0px_0px_#111827]"
                  : "text-slate-700 hover:bg-white hover:text-marker-blue"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Role-based links */}
          {userRole === "SUPER_ADMIN" && (
            <Link
              href="/admin"
                  className={`rounded-full px-3 py-2 transition-colors ${
                isActive("/admin")
                  ? "bg-marker-red text-white shadow-[2px_2px_0px_0px_#111827]"
                  : "text-slate-700 hover:bg-white hover:text-marker-red"
              }`}
            >
              Admin Panel
            </Link>
          )}
          {isClubOrAdmin && (
            <Link
              href="/club/dashboard"
              className="flex items-center gap-1.5 rounded-full border-2 border-slate-900 bg-marker-green px-3 py-2 font-ui text-[10px] font-bold uppercase tracking-wide text-white shadow-[2px_2px_0px_0px_#1e293b] transition-transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Club Dashboard
            </Link>
          )}
        </div>

        {/* Icons & Profile */}
        <div className="flex items-center space-x-4 text-slate-600">
          <button
            aria-label="Notifications"
            className="hover:bg-slate-100 p-2 rounded-full transition-colors flex items-center justify-center text-slate-600"
          >
            <Bell size={18} />
          </button>
          <button
            aria-label="Settings"
            className="hover:bg-slate-100 p-2 rounded-full transition-colors hidden sm:flex items-center justify-center text-slate-600"
          >
            <Settings size={18} />
          </button>

          {/* Sign in / Avatar dropdown */}
          <div className="relative" ref={ref}>
            {userName ? (
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-10 h-10 rounded-full bg-marker-blue/10 border-2 border-slate-900 flex items-center justify-center hover:scale-110 transition-transform active:scale-95 text-slate-900 font-marker font-bold text-lg"
              >
                {userName.charAt(0).toUpperCase()}
              </button>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2 text-sm font-marker font-bold bg-marker-blue text-white hover:-translate-y-0.5 rounded-full border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1e293b] transition-transform"
              >
                Sign in
              </Link>
            )}

            {/* Dropdown menu */}
            {menuOpen && userName && (
              <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_#1e293b] p-2 animate-zoom-in z-50">
                <div className="px-3 py-2.5 border-b-2 border-slate-900/10 mb-1">
                  <p className="font-marker text-base font-bold text-slate-900">{userName}</p>
                  {userEmail && (
                    <p className="text-slate-500 text-xs font-medium truncate">{userEmail}</p>
                  )}
                  {userRole && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                      {userRole === "SUPER_ADMIN"
                        ? "Admin"
                        : userRole === "CLUB"
                        ? "Club Account"
                        : "Student"}
                    </span>
                  )}
                </div>

                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <User size={16} className="text-slate-500" />
                  My Dashboard
                </Link>
                <div className="border-t-2 border-slate-900/10 mt-1 pt-1">
                  {/* Plain anchor (not Next Link) so the logout request does a
                      full page navigation — client-side transitions to an API
                      route leave the logged-in UI stale after the redirect. */}
                  <a
                    href="/api/auth/logout"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                  >
                    Sign out
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
