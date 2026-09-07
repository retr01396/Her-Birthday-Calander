import { CheckCircle, Search, Users, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface OrgCardProps {
  data: {
    id: string;
    slug: string;
    name: string;
    category: string;
    tagline?: string;
    description?: string;
    logoUrl?: string;
    coverUrl?: string;
    _count?: { members: number };
  };
  isSelected: boolean;
  isDisabled: boolean;
  onToggleSelect: (e: React.MouseEvent) => void;
}

export function OrgCard({ data, isSelected, isDisabled, onToggleSelect }: OrgCardProps) {
  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent) => {
    // If clicking on the select button area, don't navigate
    if ((e.target as HTMLElement).closest('.select-action')) return;
    
    // Navigate to club profile
    router.push(`/clubs/${data.slug}?from=onboarding`);
  };

  const isTech = data.category === "TECH" || data.name.toLowerCase().includes("tech") || data.name.toLowerCase().includes("code");
  const isArts = data.category === "ARTS" || data.name.toLowerCase().includes("art") || data.name.toLowerCase().includes("stage");
  
  const badgeText = isTech ? "Tech" : isArts ? "Arts" : data.category === "PROFESSIONAL_BODY" ? "Professional" : "General";
  const headerBg = isTech ? "bg-[#E0E8FF]" : isArts ? "bg-[#FFE5E0]" : "bg-[#F1F5F9]";

  return (
    <article 
      onClick={handleCardClick}
      className={`group relative rounded-[24px] bg-white transition-all flex flex-col overflow-hidden cursor-pointer ${
        isSelected
          ? "border-2 border-[#3C7BFF] shadow-md"
          : "border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
      } ${isDisabled && !isSelected ? "opacity-60 grayscale-[30%] cursor-not-allowed" : ""}`}
    >
      {isSelected && (
        <div className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-[#3C7BFF] flex items-center justify-center text-white shadow-sm">
          <CheckCircle size={20} fill="currentColor" className="text-white" />
        </div>
      )}

      <div className={`h-28 ${headerBg} relative flex justify-center items-end pb-4`}>
        {data.coverUrl && (
           <Image src={data.coverUrl} alt="Cover" fill className="object-cover opacity-30 mix-blend-overlay pointer-events-none" />
        )}
        <div 
          className="absolute -bottom-8 w-16 h-16 rounded-xl bg-white border-4 border-white shadow-sm overflow-hidden flex items-center justify-center bg-cover bg-center"
          style={data.logoUrl ? { backgroundImage: `url('${data.logoUrl}')` } : undefined}
        >
          {!data.logoUrl && (
            <span className="font-bold text-gray-400 text-2xl">{data.name.charAt(0)}</span>
          )}
        </div>
      </div>

      <div className="p-6 pt-12 flex flex-col flex-grow gap-4">
        <div className="flex justify-between items-start w-full">
          <span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
            {badgeText}
          </span>
          <div className="flex items-center gap-1 text-gray-500">
            <Users size={16} />
            <span className="text-xs font-semibold">{data._count?.members || 0}+</span>
          </div>
        </div>
        
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-snug line-clamp-2">{data.name}</h3>
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
            {data.tagline || data.description || "A community organization."}
          </p>
        </div>

        <div className="mt-auto flex justify-between items-center pt-4">
          <span className="text-[#3C7BFF] text-sm font-semibold hover:underline">View Profile</span>
          <button 
            onClick={onToggleSelect}
            disabled={isDisabled && !isSelected}
            className={`select-action px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm ${
              isSelected
                ? "bg-[#3C7BFF] text-white hover:bg-blue-600"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {isSelected ? "Selected" : "Select"}
          </button>
        </div>
      </div>
    </article>
  );
}
