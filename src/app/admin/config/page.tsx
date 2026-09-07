import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { getSystemConfig, setSystemConfig } from "@/app/actions/adminActions";
import Link from "next/link";
import { Settings, ArrowLeft } from "lucide-react";

export default async function AdminConfigPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const academicYearStart = await getSystemConfig("ACADEMIC_YEAR_START");

  return (
    <main className="min-h-screen bg-[#faf8ff] p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
              <Settings size={24} className="text-slate-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-[#191b24]">
                System Config
              </h1>
              <p className="text-[#64748b] mt-1">
                Global variables used across the platform.
              </p>
            </div>
          </div>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#004fd9] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Link>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-3xl p-8 shadow-sm">
          <form
            action={async (formData: FormData) => {
              "use server";
              const value = formData.get("value") as string;
              await setSystemConfig("ACADEMIC_YEAR_START", value || "");
            }}
            className="space-y-5"
          >
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#64748b] mb-2">
                Academic Year Start
              </label>
              <input
                name="value"
                type="date"
                defaultValue={academicYearStart ?? ""}
                placeholder="2025-07-01"
                className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] focus:border-[#004fd9] focus:ring-2 focus:ring-[#004fd9]/20 outline-none transition-all text-sm"
              />
              <p className="text-xs text-[#94a3b8] mt-2">
                Used by the leaderboard to compute yearly activity windows.
                Stored in the <code className="font-mono">SystemConfig</code>{" "}
                table.
              </p>
            </div>

            <button
              type="submit"
              className="px-8 py-3 bg-[#004fd9] text-white rounded-xl font-bold text-sm hover:bg-[#2e69f9] transition-all active:scale-[0.98] shadow-sm"
            >
              Save Config
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
