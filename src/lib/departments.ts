export const DEPARTMENTS = [
  { name: "Civil Engineering", divisions: ["CE"] },
  {
    name: "Computer Science & Engineering",
    divisions: ["CSE-A", "CSE-B", "CSE-C", "CSE-D"],
  },
  {
    name: "Computer Science & Engineering (Data Science)",
    divisions: ["CSDS"],
  },
  { name: "Computer Science & Business Systems", divisions: ["CSBS"] },
  { name: "Electronics & Communication Engineering", divisions: ["ECE"] },
  { name: "Electronics (VLSI Design)", divisions: ["VLSI"] },
  { name: "Electrical & Electronics Engineering", divisions: ["EEE"] },
  { name: "Mechanical Engineering", divisions: ["ME"] },
] as const;

export type DepartmentName = (typeof DEPARTMENTS)[number]["name"];
export type DivisionName = (typeof DEPARTMENTS)[number]["divisions"][number];

/**
 * Display labels for the department abbreviations stored on User.department
 * by the registration flow (see Step1ProfileDetails). Kept in sync with that
 * form; CSBS is deliberately the full "Business Systems" (not "Sys").
 */
export const DEPARTMENT_LABELS: Record<string, string> = {
  CE: "Civil Engineering (CE)",
  CSE: "Computer Science & Eng (CSE)",
  CSDS: "Computer Science & Data Science (CSDS)",
  CSBS: "Computer Science & Business Systems (CSBS)",
  ECE: "Electronics & Comm Eng (ECE)",
  VLSI: "Electronics VLSI Design (VLSI)",
  EEE: "Electrical & Electronics Eng (EEE)",
  ME: "Mechanical Engineering (ME)",
};

/** Legacy / misspelled stored values normalized to the canonical label. */
const DEPARTMENT_ALIASES: Record<string, string> = {
  "Computer Science & Business Sys (CSBS)":
    "Computer Science & Business Systems (CSBS)",
};

/**
 * Resolve any stored department value (abbreviation, full name, or legacy
 * misspelling) to its canonical display label. Unknown values pass through.
 */
export function departmentDisplayName(
  value: string | null | undefined
): string {
  if (!value) return "";
  return DEPARTMENT_LABELS[value] ?? DEPARTMENT_ALIASES[value] ?? value;
}

export type ClassOption = {
  /** Stored User.department value used for filtering. */
  department: string;
  /** Stored User.division value (null when the class has no divisions). */
  division: string | null;
  /** Display label, e.g. "Computer Science & Eng (CSE-A)". */
  label: string;
};

/**
 * The real class list students pick during onboarding (src/lib/departments.ts
 * drives the onboarding forms), with CSE expanded into its 4 divisions.
 */
export const CLASS_OPTIONS: ClassOption[] = [
  { department: "CE", division: null, label: "Civil Engineering (CE)" },
  { department: "CSE", division: "CSE-A", label: "Computer Science & Eng (CSE-A)" },
  { department: "CSE", division: "CSE-B", label: "Computer Science & Eng (CSE-B)" },
  { department: "CSE", division: "CSE-C", label: "Computer Science & Eng (CSE-C)" },
  { department: "CSE", division: "CSE-D", label: "Computer Science & Eng (CSE-D)" },
  {
    department: "CSDS",
    division: null,
    label: "Computer Science & Data Science (CSDS)",
  },
  {
    department: "CSBS",
    division: null,
    label: "Computer Science & Business Systems (CSBS)",
  },
  { department: "ECE", division: null, label: "Electronics & Comm Eng (ECE)" },
  { department: "VLSI", division: null, label: "Electronics VLSI Design (VLSI)" },
  { department: "EEE", division: null, label: "Electrical & Electronics Eng (EEE)" },
  { department: "ME", division: null, label: "Mechanical Engineering (ME)" },
];

/**
 * Build the display name for a student's class: department + division.
 * CSE students show their specific division, e.g. "Computer Science & Eng (CSE-A)".
 */
export function classDisplayName(
  department: string | null | undefined,
  division: string | null | undefined
): string {
  const base = departmentDisplayName(department);
  if (!division) return base;
  const parenthetical = base.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (parenthetical && /^CSE$/i.test(parenthetical[2])) {
    return `${parenthetical[1]} (${division})`;
  }
  return `${base} (${division})`;
}
