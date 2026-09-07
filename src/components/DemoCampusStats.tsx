"use client"

import { useState } from "react"
import { GlassCard, ScrollReveal } from "@/components/motion-primitives"
import { Activity, CalendarDays, CheckCircle2, GraduationCap, Users } from "lucide-react"

const activity = [42, 58, 51, 76, 88, 67, 94]
const engagement = [
  ["Music Club", 88], ["Robotics Club", 81], ["Dance Club", 74], ["Science Club", 68], ["Actor's Club", 61], ["Speech Club", 56],
]

function DemoBadge() {
  return <span className="font-mono text-[9px] font-bold uppercase tracking-[.16em] text-marker-red">Demo data · presentation only</span>
}

function ActivityChart() {
  const [active, setActive] = useState<number | null>(null)
  const points = activity.map((value, index) => `${index * 16.66},${100 - value}`).join(" ")
  return (
    <div className="relative mt-6 h-48">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible" role="img" aria-label="Demo campus activity line chart">
        <defs><linearGradient id="activity-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#155eef" stopOpacity=".28" /><stop offset="1" stopColor="#155eef" stopOpacity="0" /></linearGradient></defs>
        {[20, 40, 60, 80].map((line) => <line key={line} x1="0" x2="100" y1={line} y2={line} stroke="#111827" strokeOpacity=".12" strokeDasharray="1 2" />)}
        <polyline points={`0,100 ${points} 100,100`} fill="url(#activity-fill)" stroke="none" />
        <polyline points={points} fill="none" stroke="#155eef" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
        {activity.map((value, index) => <circle key={index} cx={index * 16.66} cy={100 - value} r="2" fill="#f6f2e9" stroke="#111827" strokeWidth="1" vectorEffect="non-scaling-stroke" onMouseEnter={() => setActive(index)} onMouseLeave={() => setActive(null)} />)}
      </svg>
      {active !== null && <div className="absolute -top-2 rounded-lg border border-slate-900 bg-[#f6f2e9] px-2 py-1 font-mono text-[10px] font-bold" style={{ left: `${active * 16.66}%` }}>{activity[active]} interactions</div>}
      <div className="mt-2 flex justify-between font-mono text-[9px] font-bold uppercase tracking-[.12em] text-slate-500">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <span key={day}>{day}</span>)}</div>
    </div>
  )
}

function DonutChart() {
  return <div className="flex items-center gap-7"><div className="relative h-36 w-36 shrink-0 rounded-full" style={{ background: "conic-gradient(#155eef 0 52%, #10b981 52% 80%, #d94735 80% 92%, #f3d45e 92% 100%)" }}><div className="absolute inset-7 flex items-center justify-center rounded-full bg-[#f6f2e9] font-display text-2xl text-slate-900">mix</div></div><div className="space-y-2 font-mono text-[10px] font-bold uppercase tracking-[.1em] text-slate-600"><p><i className="mr-2 inline-block h-2 w-2 rounded-full bg-marker-blue" />Clubs · 52%</p><p><i className="mr-2 inline-block h-2 w-2 rounded-full bg-marker-green" />Bodies · 28%</p><p><i className="mr-2 inline-block h-2 w-2 rounded-full bg-marker-red" />Events · 12%</p><p><i className="mr-2 inline-block h-2 w-2 rounded-full bg-highlighter" />Other · 8%</p></div></div>
}

export default function DemoCampusStats() {
  const kpis = [["Active Students", "1,284", GraduationCap], ["Active Clubs", "18", Users], ["Professional Bodies", "4", Activity], ["Events This Month", "27", CalendarDays], ["Total Check-ins", "3,842", CheckCircle2]] as const
  return (
    <section className="mb-14 space-y-5" aria-label="Demo campus statistics">
      <div className="flex items-center justify-between"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[.22em] text-marker-blue">Campus intelligence</p><h2 className="mt-2 font-display text-4xl text-slate-900">The week in motion.</h2></div><DemoBadge /></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{kpis.map(([label, value, Icon]) => <GlassCard key={label} className="p-4"><Icon size={17} className="text-marker-blue" /><p className="mt-5 font-mono text-[9px] font-bold uppercase tracking-[.1em] text-slate-500">{label}</p><p className="mt-1 font-display text-3xl text-slate-900">{value}</p></GlassCard>)}</div>
      <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
        <ScrollReveal><GlassCard><div className="flex items-start justify-between"><div><h3 className="font-display text-3xl text-slate-900">Campus activity</h3><p className="mt-1 text-sm text-slate-500">Interactions across the demo period</p></div><span className="font-mono text-xs font-bold text-marker-green">+18.4%</span></div><ActivityChart /></GlassCard></ScrollReveal>
        <ScrollReveal delay={.08}><GlassCard><h3 className="font-display text-3xl text-slate-900">Participation mix</h3><p className="mt-1 text-sm text-slate-500">A fictional prototype distribution</p><div className="mt-7"><DonutChart /></div></GlassCard></ScrollReveal>
      </div>
      <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
        <GlassCard><h3 className="font-display text-3xl text-slate-900">This month</h3><p className="mt-5 font-display text-6xl text-marker-blue">+18.4%</p><p className="mt-2 text-sm text-slate-500">vs previous demo period</p></GlassCard>
        <GlassCard><div className="flex items-start justify-between"><div><h3 className="font-display text-3xl text-slate-900">Club engagement</h3><p className="mt-1 text-sm text-slate-500">Fictional engagement score</p></div><DemoBadge /></div><div className="mt-6 space-y-3">{engagement.map(([name, score]) => <div key={name} className="grid grid-cols-[120px_1fr_35px] items-center gap-3 text-xs"><span className="truncate font-ui font-semibold text-slate-700">{name}</span><span className="h-2 overflow-hidden rounded-full bg-slate-900/10"><span className="block h-full rounded-full bg-marker-blue" style={{ width: `${score}%` }} /></span><b className="font-mono text-[10px]">{score}</b></div>)}</div></GlassCard>
      </div>
    </section>
  )
}
