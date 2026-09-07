import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { QrCode, Calendar, ArrowRight, ShieldCheck } from "lucide-react";

export default async function ClubScannerHubPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "CLUB" && user.role !== "SUPER_ADMIN")) {
    redirect("/club/login");
  }

  let clubId = user.clubId;
  if (user.role === "SUPER_ADMIN" && !clubId) {
    const firstClub = await prisma.club.findFirst();
    if (firstClub) clubId = firstClub.id;
  }

  if (!clubId) {
    redirect("/club/login");
  }

  const events = await prisma.event.findMany({
    where: { clubId },
    select: {
      id: true,
      title: true,
      passType: true,
      startDate: true,
      location: true,
      _count: { select: { registrations: true } },
    },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Event Entry Terminal</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">QR Code Scanner</h1>
            <p className="text-slate-400 text-sm mt-1">
              Select an event to launch the live camera attendance scanner.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Select Active Event to Scan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((evt) => (
              <Link
                key={evt.id}
                href={`/club/dashboard/events/${evt.id}/scanner`}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-850 transition group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono">
                      {evt.passType}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {evt._count.registrations} passes
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-base group-hover:text-indigo-300 transition">
                    {evt.title}
                  </h3>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(evt.startDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-400">
                  <span>Launch Camera Scanner</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            ))}
            {events.length === 0 && (
              <div className="col-span-2 p-10 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 text-sm">
                No events created yet. Create an event first from the Club Dashboard.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
