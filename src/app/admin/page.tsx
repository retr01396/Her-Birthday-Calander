import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Users, Building2, Ticket, Settings, Calendar as CalendarIcon, BarChart3, ClipboardCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";

import { Navbar } from "@/components/Navbar";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const [totalClubs, totalStudents, totalEvents, totalRegistrations] = await Promise.all([
    prisma.club.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.event.count(),
    prisma.registration.count(),
  ]);

  const links = [
    {
      href: "/admin/users",
      label: "Manage Users",
      description: "View the user roster and manage roles",
      icon: Users,
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-200",
    },
    {
      href: "/admin/clubs",
      label: "Manage Clubs",
      description: "Create campus clubs and manage their accounts",
      icon: Building2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
    {
      href: "/admin/config",
      label: "System Config",
      description: "Set academic year and global variables",
      icon: Settings,
      color: "text-slate-600",
      bg: "bg-slate-50",
      border: "border-slate-200",
    },
    {
      href: "/admin/reports",
      label: "Reports & Analytics",
      description: "Participation analytics, CSV exports, and pending onboarding tracker",
      icon: BarChart3,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      href: "/admin/submissions",
      label: "Verify Submissions",
      description: "Approve, reject, or revert club-submitted external event points",
      icon: ClipboardCheck,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf8ff]">
      <Navbar
        userRole={user.role as any}
        userName={user.name}
        userEmail={user.email}
      />
      <main className="max-w-5xl mx-auto p-8 pt-28">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center">
            <ShieldCheck size={24} className="text-violet-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#191b24]">
              Admin Panel
            </h1>
            <p className="text-[#64748b] mt-1">
              Welcome back, {user.name}. Manage the campus ecosystem.
            </p>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 text-slate-500 mb-2 font-semibold text-sm">
              <Building2 size={16} /> Total Clubs
            </div>
            <span className="text-3xl font-black text-slate-800">{totalClubs}</span>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 text-slate-500 mb-2 font-semibold text-sm">
              <Users size={16} /> Total Students
            </div>
            <span className="text-3xl font-black text-slate-800">{totalStudents}</span>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 text-slate-500 mb-2 font-semibold text-sm">
              <CalendarIcon size={16} /> Total Events
            </div>
            <span className="text-3xl font-black text-slate-800">{totalEvents}</span>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 text-slate-500 mb-2 font-semibold text-sm">
              <Ticket size={16} /> Registrations
            </div>
            <span className="text-3xl font-black text-slate-800">{totalRegistrations}</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${link.bg} ${link.border} border-2 rounded-3xl p-8 hover:shadow-lg transition-all group active:scale-[0.98]`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${link.bg} border ${link.border} flex items-center justify-center mb-5`}
                >
                  <Icon size={28} className={link.color} />
                </div>
                <h2 className="text-xl font-bold text-[#191b24] mb-2 group-hover:underline">
                  {link.label}
                </h2>
                <p className="text-sm text-[#64748b] leading-relaxed">
                  {link.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
    </div>
  );
}
