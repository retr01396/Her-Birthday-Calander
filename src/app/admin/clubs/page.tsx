import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { getAllClubs } from "@/app/actions/adminActions";
import Link from "next/link";
import { Building2, Settings2, KeyRound } from "lucide-react";

export default async function AdminClubsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const clubs = await getAllClubs();

  return (
    <main className="min-h-screen bg-[#faf8ff] p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#191b24]">
              Manage Clubs
            </h1>
            <p className="text-[#64748b] mt-1">
              Create new campus clubs and manage their accounts.
            </p>
          </div>
          <Link
            href="/admin"
            className="text-sm text-[#64748b] hover:text-[#004fd9] transition-colors"
          >
            &larr; Back to Admin
          </Link>
        </div>

        {/* Create Club CTA — dedicated credential-generation page */}
        <Link
          href="/admin/clubs/create"
          className="flex items-center justify-between gap-4 bg-white border-2 border-dashed border-[#cbd5e1] rounded-3xl p-8 hover:border-[#004fd9] hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#004fd9]/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <KeyRound size={24} className="text-[#004fd9]" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-[#191b24]">
                Create New Club Account
              </h2>
              <p className="text-sm text-[#64748b] mt-1">
                Generate a unique club username &amp; password for login access.
              </p>
            </div>
          </div>
          <span className="text-[#004fd9] font-bold text-sm group-hover:translate-x-1 transition-transform">
            Go &rarr;
          </span>
        </Link>

        {/* Clubs List */}
        <div className="mt-8 space-y-4">
          {clubs.map((club) => {
            const isSuspended = club.suspended;
            const isDraft = club.status === "UNPUBLISHED";
            return (
              <div
                key={club.id}
                className="bg-white border border-[#e2e8f0] rounded-2xl p-6 hover:shadow-md transition-all relative"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-center shrink-0">
                      <Building2 size={22} className="text-emerald-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg text-[#191b24]">
                          {club.name}
                        </h3>
                        {isSuspended && (
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Suspended
                          </span>
                        )}
                        {isDraft && !isSuspended && (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Draft / Unpublished
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {(club.category ?? "GENERAL").replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-sm text-[#64748b] mt-1 max-w-lg">
                        {club.description}
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-xs text-[#64748b]">
                          {club._count.events} event
                          {club._count.events !== 1 ? "s" : ""}
                        </span>
                        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                          {club._count.members} member
                          {club._count.members !== 1 ? "s" : ""}
                        </span>
                        <span className="text-xs text-[#64748b] font-mono">
                          @{club.username}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className="text-xs text-[#64748b] font-mono">
                      {new Date(club.createdAt).toLocaleDateString()}
                    </span>
                    {isDraft && !isSuspended ? (
                      <span className="flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg">
                        Awaiting club setup
                      </span>
                    ) : (
                      <Link
                        href={
                          club.slug ? `/clubs/${club.slug}` : "/clubs"
                        }
                        className="flex items-center gap-1 text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        <Settings2 className="w-3.5 h-3.5" />
                        View Page
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {clubs.length === 0 && (
            <div className="text-center py-16 text-[#64748b]">
              <Building2 size={40} className="mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No clubs created yet</p>
              <p className="text-sm mt-1">
                Click above to create your first club and its login credentials.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
