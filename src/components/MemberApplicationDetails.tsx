"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";

interface MemberApplicationDetailsProps {
  answers: Record<string, unknown> | null | undefined;
  /** Label lookup for answer keys (defaults + club custom questions). */
  labels?: Record<string, string>;
}

const DEFAULT_LABELS: Record<string, string> = {
  fullName: "Full Name",
  rollNumber: "Roll Number",
  phone: "Phone Number",
};

export default function MemberApplicationDetails({
  answers,
  labels = {},
}: MemberApplicationDetailsProps) {
  const [open, setOpen] = useState(false);

  const labelMap: Record<string, string> = { ...DEFAULT_LABELS, ...labels };
  const entries = Object.entries(answers ?? {}).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );

  if (entries.length === 0) {
    return (
      <span className="text-xs text-slate-400 italic">
        No joining details
      </span>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-primary transition-colors"
      >
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        Joining Details ({entries.length})
      </button>

      {open && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-200">
          {entries.map(([key, value], i) => (
            <div
              key={i}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <FileText size={11} />
                {labelMap[key] || key}
              </p>
              <p className="text-sm font-semibold text-slate-800 break-words mt-0.5">
                {Array.isArray(value) ? value.join(", ") : String(value)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
