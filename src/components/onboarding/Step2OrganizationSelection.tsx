import { useState, useEffect } from "react";
import { Loader2, AlertCircle, Search, ArrowLeft } from "lucide-react";
import { OrgCard } from "./OrgCard";
import ClubJoiningFlow from "../ClubJoiningFlow";

interface Step2Props {
  selections: {
    clubIds: string[];
    professionalBodyId: string | null;
    applications?: Record<string, Record<string, any>>;
  };
  updateSelections: (selections: any) => void;
  onSubmit: () => void;
  onBack: () => void;
  studentName?: string;
}

export function Step2OrganizationSelection({
  selections,
  updateSelections,
  onSubmit,
  onBack,
  studentName,
}: Step2Props) {
  const [activeTab, setActiveTab] = useState<"CLUBS" | "PROFESSIONAL">("CLUBS");
  const [clubs, setClubs] = useState<any[]>([]);
  const [profBodies, setProfBodies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [joiningClub, setJoiningClub] = useState<any | null>(null);

  useEffect(() => {
    async function fetchOrgs() {
      try {
        const res = await fetch("/api/onboarding/organizations");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load organizations");
        setClubs(data.generalClubs || []);
        setProfBodies(data.professionalBodies || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchOrgs();
  }, []);

  const handleToggleClub = (e: React.MouseEvent, org: any) => {
    e.stopPropagation();
    const id = org.id;
    const isSelected = selections.clubIds.includes(id);
    if (isSelected) {
      // Remove the club (and its stored application answers)
      const applications = { ...(selections.applications || {}) };
      delete applications[id];
      updateSelections({
        clubIds: selections.clubIds.filter((cid) => cid !== id),
        applications,
      });
    } else {
      if (selections.clubIds.length >= 2) return;
      // Opening the dynamic membership application flow
      setJoiningClub(org);
    }
  };

  const handleToggleProfBody = (e: React.MouseEvent, org: any) => {
    e.stopPropagation();
    const id = org.id;
    if (selections.professionalBodyId === id) {
      // Remove the selection (and its stored application answers)
      const applications = { ...(selections.applications || {}) };
      delete applications[id];
      updateSelections({ professionalBodyId: null, applications });
    } else {
      const hasQuestions = (org.customFormFields || []).filter(
        (f: any) => f && f.id && f.label
      ).length > 0;
      if (hasQuestions) {
        // Ask the membership application questions first, then select.
        setJoiningClub(org);
      } else {
        updateSelections({ professionalBodyId: id });
      }
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit();
    } catch (err: any) {
      setError(err.message || "An error occurred.");
      setIsSubmitting(false);
    }
  };

  const isComplete = selections.clubIds.length === 2 && selections.professionalBodyId !== null;

  const currentList = activeTab === "CLUBS" ? clubs : profBodies;
  const displayedOrgs = currentList.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (org.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (activeFilter === "Tech") {
      matchesFilter = org.category === "TECH" || org.name.toLowerCase().includes("tech") || org.name.toLowerCase().includes("code");
    } else if (activeFilter === "Arts") {
      matchesFilter = org.category === "ARTS" || org.name.toLowerCase().includes("art") || org.name.toLowerCase().includes("stage");
    } else if (activeFilter === "Sports") {
      matchesFilter = org.category === "SPORTS" || org.name.toLowerCase().includes("sport");
    } else if (activeFilter === "Social Service") {
      matchesFilter = org.category === "SOCIAL" || org.name.toLowerCase().includes("social") || org.name.toLowerCase().includes("service");
    }

    return matchesSearch && matchesFilter;
  });

  const toggleFilter = (filterName: string) => {
    setActiveFilter(activeFilter === filterName ? null : filterName);
  };

  return (
    <div className="bg-gray-50 text-[#1E293B] font-sans antialiased min-h-screen flex flex-col pt-32 pb-24">
      {/* Sticky Header Area */}
      <header className="fixed top-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-4 flex flex-col gap-4">
          <div className="flex justify-between items-center w-full">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Select Your Organizations</h1>
            <div className="hidden md:flex gap-4 items-center">
              <div className="flex flex-col items-end">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Clubs Selected</span>
                <span className="text-xl font-bold text-[#3C7BFF]">{selections.clubIds.length} <span className="text-gray-400 font-medium text-base">/ 2</span></span>
              </div>
              <div className="w-px h-10 bg-gray-200"></div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Prof. Bodies</span>
                <span className={`text-xl font-bold ${selections.professionalBodyId ? "text-[#3C7BFF]" : "text-[#FF6B6B]"}`}>
                  {selections.professionalBodyId ? 1 : 0} <span className="text-gray-400 font-medium text-base">/ 1</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-end border-b border-gray-200">
            <div className="flex gap-8">
              <button 
                onClick={() => { setActiveTab("CLUBS"); setActiveFilter(null); }}
                className={`pb-2 border-b-2 font-semibold text-sm transition-colors ${activeTab === "CLUBS" ? "border-[#3C7BFF] text-[#3C7BFF]" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
              >
                Clubs
              </button>
              <button 
                onClick={() => { setActiveTab("PROFESSIONAL"); setActiveFilter(null); }}
                className={`pb-2 border-b-2 font-semibold text-sm transition-colors ${activeTab === "PROFESSIONAL" ? "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
              >
                Professional Bodies
              </button>
            </div>
            {/* Mobile Counters */}
            <div className="md:hidden flex gap-2 pb-2 text-xs font-semibold text-gray-500">
              <span>Clubs: {selections.clubIds.length}/2</span>
              <span>|</span>
              <span>Pro: {selections.professionalBodyId ? 1 : 0}/1</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-grow max-w-[1280px] mx-auto w-full px-5 md:px-10 flex flex-col gap-8 mt-4">
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-[#3C7BFF] focus:ring-1 focus:ring-[#3C7BFF] transition-all outline-none shadow-sm" 
              placeholder="Search by name or keyword..." 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 justify-start md:justify-end w-full md:w-auto">
            <button 
              onClick={() => toggleFilter("Tech")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border shadow-sm hover:shadow-md ${activeFilter === "Tech" ? "bg-[#3C7BFF] text-white border-[#3C7BFF]" : "bg-white text-gray-600 border-gray-200 hover:bg-[#3C7BFF] hover:text-white"}`}>
              Tech
            </button>
            <button 
              onClick={() => toggleFilter("Arts")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border shadow-sm hover:shadow-md ${activeFilter === "Arts" ? "bg-[#FF6B6B] text-white border-[#FF6B6B]" : "bg-white text-gray-600 border-gray-200 hover:bg-[#FF6B6B] hover:text-white"}`}>
              Arts
            </button>
            <button 
              onClick={() => toggleFilter("Sports")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border shadow-sm hover:shadow-md ${activeFilter === "Sports" ? "bg-[#3C7BFF] text-white border-[#3C7BFF]" : "bg-white text-gray-600 border-gray-200 hover:bg-[#3C7BFF] hover:text-white"}`}>
              Sports
            </button>
            <button 
              onClick={() => toggleFilter("Social Service")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border shadow-sm hover:shadow-md ${activeFilter === "Social Service" ? "bg-[#3C7BFF] text-white border-[#3C7BFF]" : "bg-white text-gray-600 border-gray-200 hover:bg-[#3C7BFF] hover:text-white"}`}>
              Social Service
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 w-full">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 size={32} className="animate-spin mb-4" />
            <p>Loading organizations...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedOrgs.map((org) => (
              <OrgCard
                key={org.id}
                data={org}
                isSelected={activeTab === "CLUBS" ? selections.clubIds.includes(org.id) : selections.professionalBodyId === org.id}
                isDisabled={activeTab === "CLUBS" ? selections.clubIds.length >= 2 : false}
                onToggleSelect={(e) => activeTab === "CLUBS" ? handleToggleClub(e, org) : handleToggleProfBody(e, org)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Sticky Bottom Footer */}
      <footer className="fixed bottom-0 w-full z-40 bg-white border-t border-gray-200 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-[1280px] mx-auto w-full px-5 md:px-10 flex justify-between items-center">
          <button 
            onClick={onBack}
            className="px-6 py-3 rounded-xl bg-white text-gray-700 font-semibold text-sm border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <button 
            onClick={handleComplete}
            disabled={!isComplete || isSubmitting}
            className={`px-8 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${
              isComplete && !isSubmitting ? "bg-[#3C7BFF] text-white hover:bg-blue-600 shadow-sm" : "bg-[#3C7BFF] text-white opacity-50 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : null}
            {isSubmitting ? "Completing..." : "Complete Registration 🎉"}
          </button>
        </div>
      </footer>

      {/* ── Dynamic Club Membership Application Flow ── */}
      <ClubJoiningFlow
        club={joiningClub}
        isOpen={!!joiningClub}
        onClose={() => setJoiningClub(null)}
        prefill={{ name: studentName }}
        onSubmitApplication={async (answers) => {
          // During onboarding the student isn't signed up yet — store answers
          // locally and persist them to the DB when the account is created.
          if (joiningClub) {
            updateSelections({
              applications: {
                ...(selections.applications || {}),
                [joiningClub.id]: answers,
              },
            });
            return { whatsappGroupUrl: joiningClub.whatsappGroupUrl ?? null };
          }
          return { whatsappGroupUrl: null };
        }}
        onSuccess={(clubId) => {
          if (joiningClub?.category === "PROFESSIONAL_BODY") {
            // Professional bodies with application questions go through the
            // same modal — select them on completion instead of adding a club.
            updateSelections({ professionalBodyId: clubId });
          } else if (
            !selections.clubIds.includes(clubId) &&
            selections.clubIds.length < 2
          ) {
            updateSelections({ clubIds: [...selections.clubIds, clubId] });
          }
          setJoiningClub(null);
        }}
      />
    </div>
  );
}
