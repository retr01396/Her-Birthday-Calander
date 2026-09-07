import { X, Users } from "lucide-react";
import Image from "next/image";

interface OrgDetailDrawerProps {
  data: {
    id: string;
    name: string;
    description: string;
    about?: string;
    logoUrl?: string;
    coverUrl?: string;
    category: string;
    _count?: { members: number };
  };
  isOpen: boolean;
  onClose: () => void;
  isSelected: boolean;
  onSelect: () => void;
  isDisabled: boolean;
}

export function OrgDetailDrawer({
  data,
  isOpen,
  onClose,
  isSelected,
  onSelect,
  isDisabled,
}: OrgDetailDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-surface shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="relative h-48 bg-surface-container-low flex-shrink-0">
          {data.coverUrl ? (
            <Image src={data.coverUrl} alt="Cover" fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-tertiary/20" />
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="absolute -bottom-10 left-6 w-20 h-20 rounded-2xl bg-surface border-4 border-surface shadow-sm overflow-hidden flex items-center justify-center">
            {data.logoUrl ? (
              <Image src={data.logoUrl} alt={data.name} fill className="object-cover" />
            ) : (
              <span className="font-headline-md text-muted">{data.name.charAt(0)}</span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pt-14 px-6 pb-6">
          <h2 className="font-headline-md text-on-surface mb-2">{data.name}</h2>
          
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-block px-2.5 py-1 rounded-md bg-surface-container-high text-[12px] font-label-caps tracking-wide text-secondary">
              {data.category === "PROFESSIONAL_BODY" ? "Professional Body" : "General Club"}
            </span>
            {data._count && (
              <div className="flex items-center gap-1.5 text-secondary text-[13px] font-body-sm">
                <Users size={14} />
                <span>{data._count.members} Members</span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="font-label-lg text-on-surface mb-2">About</h3>
              <p className="font-body-md text-secondary whitespace-pre-wrap">
                {data.about || data.description || "No details provided."}
              </p>
            </section>
          </div>
        </div>

        <div className="p-6 border-t border-border-subtle bg-surface flex-shrink-0">
          <button
            onClick={() => {
              onSelect();
              onClose();
            }}
            disabled={isDisabled && !isSelected}
            className={`w-full py-3.5 rounded-xl font-headline-sm transition-all ${
              isSelected
                ? "bg-error/10 text-error hover:bg-error/20"
                : "bg-primary text-on-primary hover:bg-on-primary-fixed-variant"
            } ${isDisabled && !isSelected ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isSelected ? "Remove Selection" : "Select Organization"}
          </button>
        </div>
      </div>
    </>
  );
}
