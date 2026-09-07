import { Navbar } from "@/components/Navbar";
import { getCurrentUser } from "@/lib/session";
import { getStudentLeaderboard, getClubLeaderboard } from "@/lib/leaderboard";
import LeaderboardClient from "@/components/LeaderboardClient";
import DemoCampusStats from "@/components/DemoCampusStats";
import { getDemoLeaderboard } from "@/lib/presentation-fixtures";

export default async function LeaderboardPage() {
  const user = await getCurrentUser();

  const [databaseStudents, databaseClubs] = await Promise.all([
    getStudentLeaderboard(),
    getClubLeaderboard(),
  ]);
  const demo = getDemoLeaderboard();
  const students = databaseStudents.length ? databaseStudents : demo.students;
  const clubs = databaseClubs.length ? databaseClubs : demo.clubs;

  return (
    <div className="min-h-screen campus-paper relative">
      <Navbar
        userRole={
          user
            ? (user.role as any)
            : null
        }
        userName={user?.name ?? undefined}
        userEmail={user?.email ?? undefined}
      />

      <main className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8">
        <DemoCampusStats />
        <LeaderboardClient students={students} clubs={clubs} />
      </main>

      {/* ── Footer ── */}
      <footer className="w-full py-12 px-margin-page mt-20 flex flex-col md:flex-row justify-between items-center gap-4 border-t-4 border-slate-900 bg-white">
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="font-marker text-3xl font-black text-slate-900">
            campushub
          </span>
          <p className="text-slate-600 font-medium">
            &copy; 2026 campushub. Built for builders.
          </p>
        </div>
        <div className="flex gap-8">
          {["Privacy", "Terms", "Support", "Twitter", "GitHub"].map((link) => (
            <a
              key={link}
              href="#"
              className="text-slate-600 hover:text-marker-blue font-bold transition-colors font-marker"
            >
              {link}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
