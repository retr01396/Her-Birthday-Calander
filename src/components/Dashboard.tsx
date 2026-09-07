"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Search,
  Bell,
  Settings,
  Zap,
  Ticket,
  Terminal,
  User,
  MoreHorizontal,
  ArrowRight,
  Building2,
  Calendar,
  MapPin,
  Bookmark,
  CalendarCheck,
  CalendarClock,
} from "lucide-react";
import ClubsDirectory from "./ClubsDirectory";
import ClubProfile from "./ClubProfile";
import EventDetail from "./EventDetail";
import UpcomingEvents from "./UpcomingEvents";
import SavedEvents from "./SavedEvents";
import HeroCircleCanvas from "./HeroCircleCanvas";
import { Navbar } from "./Navbar";
import EventCard from "./EventCard";
import { useRouter } from "next/navigation";
import {
  getAllUpcomingEvents,
  getAllClubsPublic,
  getMyUpcomingEvents,
  getSavedEventIds,
  toggleSaveEvent,
} from "@/app/actions/unifiedActions";

// ─── Saved-bookmark helper state ──────────────────────────────────────────────

type EventsTab = "upcoming" | "mine" | "saved";

// ─── Types ───────────────────────────────────────────────────────────────────

type SubView =
  | "main"
  | "clubs-directory"
  | "club-profile"
  | "event-detail"
  | "upcoming"
  | "saved";

// Types for real data from DB
interface RealEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  startTime: string;
  capacity: number;
  imageUrl: string | null;
  passType: string;
  club: { id: string; name: string; slug: string | null };
  _count: { registrations: number };
  registration?: { id: string; qrToken: string; status: string };
}

interface RealClub {
  id: string;
  name: string;
  slug: string | null;
  tagline: string | null;
  description: string;
  logoUrl: string | null;
  coverUrl: string | null;
  about: string | null;
  website: string | null;
  github: string | null;
  instagram: string | null;
  _count: { members: number; events: number };
}

// ─── Auth Types ─────────────────────────────────────────────────────────────

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

// ─── Main Dashboard Component ────────────────────────────────────────────────

export default function Dashboard() {
  const router = useRouter();
  const [subView, setSubView] = useState<SubView>("main");
  const searchRef = useRef<HTMLInputElement>(null);

  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedClubId, setSelectedClubId] = useState<string>("");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Real data from the database
  const [realEvents, setRealEvents] = useState<RealEvent[]>([]);
  const [realClubs, setRealClubs] = useState<RealClub[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Mini-navbar tabs: all upcoming / my registered / my saved
  const [eventsTab, setEventsTab] = useState<EventsTab>("upcoming");
  const [myEvents, setMyEvents] = useState<RealEvent[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Check auth on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, []);

  // Fetch real events and clubs from the database
  useEffect(() => {
    async function fetchData() {
      try {
        const [events, clubs] = await Promise.all([
          getAllUpcomingEvents(),
          getAllClubsPublic(),
        ]);
        setRealEvents(events as unknown as RealEvent[]);
        setRealClubs(clubs as unknown as RealClub[]);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setDataLoading(false);
      }
    }
    fetchData();
  }, []);

  // Fetch the student's registered + bookmarked events once we know the user
  useEffect(() => {
    if (!user) return;
    Promise.all([getMyUpcomingEvents(), getSavedEventIds()])
      .then(([mine, saved]) => {
        setMyEvents(mine as unknown as RealEvent[]);
        setSavedIds(saved);
      })
      .catch((err) => console.error("Failed to load student events:", err));
  }, [user]);

  // Toggle a bookmark and keep the Saved tab in sync
  const handleToggleSave = async (eventId: string) => {
    try {
      const res = await toggleSaveEvent(eventId);
      setSavedIds((prev) =>
        res.saved
          ? [...prev, eventId]
          : prev.filter((id) => id !== eventId)
      );
    } catch (err: any) {
      console.error(err?.message || "Failed to update bookmark");
    }
  };

  // Ctrl+K to focus search
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      searchRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Build ticker arrays dynamically from real DB clubs
  const tickerRow1 =
    realClubs.length > 0
      ? [...realClubs, ...realClubs, ...realClubs, ...realClubs].slice(0, 16)
      : [];
  const tickerRow2 =
    realClubs.length > 0
      ? [...realClubs, ...realClubs, ...realClubs, ...realClubs]
          .reverse()
          .slice(0, 16)
      : [];

  return (
    <div className="min-h-screen bg-surface-bright text-on-surface font-sans">
      {/* ── Floating Pill Navbar ── */}
      <Navbar
        userRole={(user?.role as any) ?? null}
        userName={user?.name}
        userEmail={user?.email}
      />

      {/* ── Main Content Router ── */}
      {subView === "main" && (
        <main className="w-full">
          {/* ── BEGIN: HeroSection ── */}
          <section className="relative w-full min-h-[750px] flex flex-col items-center justify-center overflow-hidden bg-primary pt-28 pb-20">
            {/* Interactive WebGL / Three.js Circle Grid Canvas */}
            <HeroCircleCanvas />

            {/* Hero Text content */}
            <div className="relative z-20 text-center px-4 mt-12 max-w-3xl">
              <h1 className="text-5xl md:text-6xl font-black text-white drop-shadow-lg mb-6 leading-tight">
                The Hub of Campus Innovation
              </h1>
              <p className="text-white/90 text-lg mb-8 bg-black/10 backdrop-blur-md p-4 rounded-xl border border-white/20 inline-block shadow-sm">
                Connect with professional bodies, discover cutting-edge events, and build your technical network in a high-performance ecosystem.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <button
                  onClick={() => router.push("/clubs")}
                  className="bg-white text-primary font-bold px-8 py-3.5 rounded-full hover:bg-slate-50 hover:-translate-y-0.5 shadow-lg shadow-black/10 transition-all w-full sm:w-auto text-base"
                >
                  Explore Clubs
                </button>
                <button
                  onClick={() => router.push("/leaderboard")}
                  className="bg-black/20 backdrop-blur-md text-white font-bold px-8 py-3.5 rounded-full border border-white/30 hover:bg-black/30 hover:-translate-y-0.5 shadow-sm transition-all w-full sm:w-auto text-base"
                >
                  View Leaderboard
                </button>
              </div>
            </div>
          </section>
          {/* ── END: HeroSection ── */}

          {/* ── BEGIN: TickerSection (Dynamic DB Clubs) ── */}
          <section className="w-full bg-white py-6 border-y border-slate-200 overflow-hidden shadow-sm z-30 relative -mt-6 rounded-t-3xl">
            {tickerRow1.length > 0 ? (
              <>
                <div className="ticker-wrapper mb-4">
                  <div className="animate-scroll-left flex items-center font-mono text-sm text-slate-600 uppercase tracking-wider">
                    {tickerRow1.map((club, idx) => (
                      <span key={`r1-${club.id}-${idx}`} className="flex items-center">
                        <button
                          onClick={() =>
                            router.push(club.slug ? `/clubs/${club.slug}` : "/clubs")
                          }
                          className="mx-3 px-3.5 py-1 border border-slate-200 rounded-md bg-slate-50 hover:bg-slate-100 hover:border-primary/40 text-slate-700 font-mono text-xs uppercase tracking-wider font-semibold transition-all"
                        >
                          {club.name}
                        </button>
                        <span className="text-slate-300 mx-1">•</span>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="ticker-wrapper">
                  <div className="animate-scroll-right flex items-center font-mono text-sm text-slate-600 uppercase tracking-wider">
                    {tickerRow2.map((club, idx) => (
                      <span key={`r2-${club.id}-${idx}`} className="flex items-center">
                        <button
                          onClick={() =>
                            router.push(club.slug ? `/clubs/${club.slug}` : "/clubs")
                          }
                          className="mx-3 px-3.5 py-1 border border-slate-200 rounded-md bg-slate-50 hover:bg-slate-100 hover:border-primary/40 text-slate-700 font-mono text-xs uppercase tracking-wider font-semibold transition-all"
                        >
                          {club.name}
                        </button>
                        <span className="text-slate-300 mx-1">•</span>
                      </span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-2 text-slate-400 font-mono text-sm">
                Loading campus clubs...
              </div>
            )}
          </section>
          {/* ── END: TickerSection ── */}

          {/* ── BEGIN: EventsSection (Tabbed Mini-Navbar) ── */}
          <section className="max-w-6xl mx-auto px-6 py-16">
            {/* Mini-navbar: Upcoming / My Upcoming / Saved */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-1">
                  Campus Events
                </h2>
                <p className="text-slate-600">
                  Browse upcoming events, your registered passes, and saved
                  bookmarks.
                </p>
              </div>

              <div className="inline-flex bg-white border border-slate-200 rounded-full p-1 shadow-sm w-full md:w-auto overflow-x-auto">
                <button
                  onClick={() => setEventsTab("upcoming")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    eventsTab === "upcoming"
                      ? "bg-primary text-white shadow-sm"
                      : "text-slate-600 hover:text-primary hover:bg-slate-50"
                  }`}
                >
                  <CalendarCheck size={14} />
                  Upcoming Events
                </button>
                <button
                  onClick={() => setEventsTab("mine")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    eventsTab === "mine"
                      ? "bg-primary text-white shadow-sm"
                      : "text-slate-600 hover:text-primary hover:bg-slate-50"
                  }`}
                >
                  <Ticket size={14} />
                  My Upcoming Events
                </button>
                <button
                  onClick={() => setEventsTab("saved")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    eventsTab === "saved"
                      ? "bg-primary text-white shadow-sm"
                      : "text-slate-600 hover:text-primary hover:bg-slate-50"
                  }`}
                >
                  <Bookmark size={14} />
                  Saved Upcoming Events
                </button>
              </div>
            </div>

            {/* ── Tab: All Upcoming Events ── */}
            {eventsTab === "upcoming" &&
              (dataLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : realEvents.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <Calendar size={48} className="mx-auto text-slate-400 mb-3" />
                  <h3 className="text-lg font-bold text-slate-800">
                    No upcoming events right now
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Events created by campus clubs will appear here dynamically.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {realEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      saved={savedIds.includes(event.id)}
                      onToggleSave={handleToggleSave}
                    />
                  ))}
                </div>
              ))}

            {/* ── Tab: My Upcoming Events (registered, with My Pass) ── */}
            {eventsTab === "mine" &&
              (!user ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <Ticket size={48} className="mx-auto text-slate-400 mb-3" />
                  <h3 className="text-lg font-bold text-slate-800">
                    Sign in to see your events
                  </h3>
                  <button
                    onClick={() => router.push("/login")}
                    className="mt-4 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Sign In
                  </button>
                </div>
              ) : myEvents.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <CalendarClock size={48} className="mx-auto text-slate-400 mb-3" />
                  <h3 className="text-lg font-bold text-slate-800">
                    No registered events yet
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Register for an event and your pass will appear here with a
                    QR code.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {myEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      registration={event.registration ?? null}
                      saved={savedIds.includes(event.id)}
                      studentName={user?.name}
                      onToggleSave={handleToggleSave}
                    />
                  ))}
                </div>
              ))}

            {/* ── Tab: Saved Upcoming Events (bookmarked) ── */}
            {eventsTab === "saved" &&
              (!user ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <Bookmark size={48} className="mx-auto text-slate-400 mb-3" />
                  <h3 className="text-lg font-bold text-slate-800">
                    Sign in to save events
                  </h3>
                  <button
                    onClick={() => router.push("/login")}
                    className="mt-4 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Sign In
                  </button>
                </div>
              ) : realEvents.filter((e) => savedIds.includes(e.id)).length ===
                0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <Bookmark size={48} className="mx-auto text-slate-400 mb-3" />
                  <h3 className="text-lg font-bold text-slate-800">
                    No saved events
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Tap the bookmark icon on any event to save it here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {realEvents
                    .filter((e) => savedIds.includes(e.id))
                    .map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        saved
                        onToggleSave={handleToggleSave}
                      />
                    ))}
                </div>
              ))}
          </section>
          {/* ── END: EventsSection ── */}
        </main>
      )}

      {/* ── Secondary SubViews ── */}
      {subView !== "main" && (
        <main className="max-w-container-max mx-auto px-4 md:px-margin-page pt-28 pb-20">
          {subView === "clubs-directory" && (
            <ClubsDirectory
              clubs={realClubs}
              onViewClub={(id) => {
                setSelectedClubId(id);
                setSubView("club-profile");
              }}
            />
          )}

          {subView === "club-profile" && (
            <ClubProfile
              clubId={selectedClubId}
              onBackToClubs={() => setSubView("clubs-directory")}
            />
          )}

          {subView === "event-detail" && (
            <EventDetail
              eventId={selectedEventId}
              onBackToDashboard={() => setSubView("main")}
            />
          )}

          {subView === "upcoming" && <UpcomingEvents events={realEvents} />}

          {subView === "saved" && <SavedEvents />}
        </main>
      )}

      {/* ── Footer ── */}
      <footer className="w-full py-12 px-margin-page flex flex-col md:flex-row justify-between items-center gap-4 bg-white border-t border-slate-200">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span
              className="text-xl font-black text-primary cursor-pointer"
              onClick={() => setSubView("main")}
            >
              CampusHub
            </span>
            <p className="text-slate-500 text-sm">
              &copy; 2026 CampusHub. Built for campus innovation.
            </p>
          </div>
          <div className="flex gap-8">
            {["Privacy", "Terms", "Support", "Twitter", "GitHub"].map(
              (link) => (
                <a
                  key={link}
                  href="#"
                  className="text-slate-500 hover:text-primary transition-colors text-sm"
                >
                  {link}
                </a>
              )
            )}
          </div>
        </footer>
    </div>
  );
}
