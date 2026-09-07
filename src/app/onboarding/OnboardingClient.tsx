"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { DEPARTMENTS } from "@/lib/departments";
import { completeOnboardingStep1, completeOnboardingStep2 } from "@/app/actions/onboardingActions";
import { Step2OrganizationSelection } from "@/components/onboarding/Step2OrganizationSelection";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "studentOnboardingState";

type Selections = {
  clubIds: string[];
  professionalBodyId: string | null;
  applications: Record<string, Record<string, any>>;
};

const ACADEMIC_YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

export default function OnboardingClient({
  initialName,
  initialDepartment,
  initialYear,
  initialDivision,
}: {
  initialName: string;
  initialDepartment: string | null;
  initialYear: string | null;
  initialDivision: string | null;
}) {
  const router = useRouter();

  // Step 1 state
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState(initialName);
  const [year, setYear] = useState(() =>
    initialYear && ACADEMIC_YEARS.includes(initialYear) ? initialYear : ""
  );
  const [department, setDepartment] = useState(() =>
    initialDepartment && DEPARTMENTS.some((d) => d.name === initialDepartment)
      ? initialDepartment
      : ""
  );
  const [division, setDivision] = useState(() => {
    if (!initialDepartment || !initialDivision) return "";
    const dept = DEPARTMENTS.find((d) => d.name === initialDepartment);
    return dept && (dept.divisions as readonly string[]).includes(initialDivision)
      ? initialDivision
      : "";
  });

  // Step 2 state (kept in sessionStorage so browsing a club profile and
  // coming back preserves the student's selections, like the old flow).
  const [selections, setSelections] = useState<Selections>({
    clubIds: [],
    professionalBodyId: null,
    applications: {},
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // False until the saved state has been restored, so the persistence effect
  // never overwrites sessionStorage with the fresh default state on mount.
  const [hydrated, setHydrated] = useState(false);

  // Restore an in-progress onboarding from sessionStorage.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved?.step === 1 || saved?.step === 2) setStep(saved.step);
        if (typeof saved?.name === "string") setName(saved.name);
        if (typeof saved?.year === "string") setYear(saved.year);
        if (typeof saved?.department === "string") setDepartment(saved.department);
        if (typeof saved?.division === "string") setDivision(saved.division);
        if (saved?.selections) {
          setSelections({
            clubIds: Array.isArray(saved.selections.clubIds)
              ? saved.selections.clubIds
              : [],
            professionalBodyId: saved.selections.professionalBodyId ?? null,
            applications: saved.selections.applications || {},
          });
        }
      }
    } catch {
      /* corrupted storage — start fresh */
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist every change so a club-profile detour doesn't lose progress.
  useEffect(() => {
    if (typeof window === "undefined" || !hydrated) return;
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ step, name, year, department, division, selections })
    );
  }, [hydrated, step, name, year, department, division, selections]);

  const selectedDeptObj = DEPARTMENTS.find((d) => d.name === department);
  const availableDivisions = selectedDeptObj ? selectedDeptObj.divisions : [];

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !year || !department || !division) {
      setError("Please fill in all fields to continue.");
      return;
    }
    setLoading(true);
    try {
      await completeOnboardingStep1({ name, year, department, division });
      setStep(2);
    } catch (err: any) {
      setError(err.message || "An error occurred while saving your details.");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    await completeOnboardingStep2({
      professionalBodyClubId: selections.professionalBodyId!,
      generalClubIds: [selections.clubIds[0], selections.clubIds[1]],
      applications: selections.applications,
    });
    // Success — clear the saved progress and enter the app.
    sessionStorage.removeItem(STORAGE_KEY);
    router.push("/dashboard");
    router.refresh();
  };

  if (step === 2) {
    return (
      <Step2OrganizationSelection
        selections={selections}
        updateSelections={(fields) =>
          setSelections((prev) => ({ ...prev, ...fields }))
        }
        onSubmit={handleComplete}
        onBack={() => setStep(1)}
        studentName={name}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 overflow-y-auto bg-[#F8FAFC]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 0%, rgba(60, 123, 255, 0.05) 0%, transparent 70%)",
      }}
    >
      {/* Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-gray-100 px-6 py-4 flex items-center justify-between">
        <a
          className="text-[#3C7BFF] font-bold text-xl tracking-tight"
          href="#"
        >
          CampusHub
        </a>
        <nav className="hidden md:flex items-center gap-8">
          <span className="text-[#3C7BFF] font-semibold border-b-2 border-[#3C7BFF] pb-1">
            Onboarding
          </span>
        </nav>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-6 md:p-10 z-10 w-full max-w-4xl mx-auto pt-32 pb-20 min-h-screen">
        <div className="w-full max-w-2xl">
          {/* Progress Indicator */}
          <div className="mb-8 flex items-center justify-center space-x-2 text-sm font-semibold">
            <span className="text-[#3C7BFF] bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 shadow-sm">
              1. Academic Details
            </span>
            <span className="text-gray-400">→</span>
            <span className="text-gray-500">2. Club Selection</span>
          </div>

          {/* Header text */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1E293B] tracking-tight leading-tight mb-4">
              Welcome! Let&rsquo;s set up your profile
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-medium">
              Enter your university details to personalize your workspace.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 md:p-8 relative">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertCircle
                  size={20}
                  className="text-red-600 flex-shrink-0 mt-0.5"
                />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleStep1Submit}>
              {/* Full Name */}
              <div>
                <label
                  className="block text-sm font-semibold text-[#1E293B] mb-2"
                  htmlFor="fullName"
                >
                  Full Name
                </label>
                <input
                  className="w-full bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 text-[#1E293B] focus:bg-white focus:ring-2 focus:ring-[#3C7BFF] focus:border-transparent outline-none transition-all shadow-sm placeholder-gray-400 font-medium"
                  id="fullName"
                  name="fullName"
                  placeholder="e.g. Jane Doe"
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Academic Year */}
              <div>
                <label
                  className="block text-sm font-semibold text-[#1E293B] mb-2"
                  htmlFor="academicYear"
                >
                  Academic Year
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 text-[#1E293B] focus:bg-white focus:ring-2 focus:ring-[#3C7BFF] focus:border-transparent outline-none appearance-none transition-all shadow-sm cursor-pointer font-medium"
                    id="academicYear"
                    name="academicYear"
                    required
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  >
                    <option disabled value="">
                      Select Year
                    </option>
                    {ACADEMIC_YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Department */}
              <div>
                <label
                  className="block text-sm font-semibold text-[#1E293B] mb-2"
                  htmlFor="department"
                >
                  Department
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 text-[#1E293B] focus:bg-white focus:ring-2 focus:ring-[#3C7BFF] focus:border-transparent outline-none appearance-none transition-all shadow-sm cursor-pointer font-medium"
                    id="department"
                    name="department"
                    required
                    value={department}
                    onChange={(e) => {
                      setDepartment(e.target.value);
                      setDivision("");
                    }}
                  >
                    <option disabled value="">
                      Select Department
                    </option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept.name} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Division / Batch */}
              <div>
                <label
                  className="block text-sm font-semibold text-[#1E293B] mb-2"
                  htmlFor="classDivision"
                >
                  Division / Batch
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 text-[#1E293B] focus:bg-white focus:ring-2 focus:ring-[#3C7BFF] focus:border-transparent outline-none appearance-none transition-all shadow-sm cursor-pointer font-medium disabled:opacity-50"
                    id="classDivision"
                    name="classDivision"
                    required
                    disabled={!department}
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                  >
                    <option disabled value="">
                      Select Division
                    </option>
                    {availableDivisions.map((div) => (
                      <option key={div} value={div}>
                        {div}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Footer / CTA */}
              <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
                <button
                  className="w-full md:w-auto px-8 py-3.5 bg-[#3C7BFF] text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 hover:bg-blue-600 disabled:opacity-60"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Continue to Club Selection"}
                  <span className="transform transition-transform">→</span>
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 flex justify-center items-center gap-4 text-sm text-gray-500 font-medium">
            <span className="flex items-center gap-1.5">Secure</span>
            <span>•</span>
            <span>University Verified</span>
          </div>
        </div>
      </main>
    </div>
  );
}
