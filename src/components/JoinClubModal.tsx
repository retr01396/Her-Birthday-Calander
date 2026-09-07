"use client";

import React from "react";
import { CheckCircle2, MessageCircle, X, ExternalLink } from "lucide-react";
import Image from "next/image";

interface JoinClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubName: string;
  whatsappGroupLink?: string | null;
  whatsappQrCodeUrl?: string | null;
}

export default function JoinClubModal({
  isOpen,
  onClose,
  clubName,
  whatsappGroupLink,
  whatsappQrCodeUrl,
}: JoinClubModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-surface border border-border-subtle rounded-3xl shadow-xl p-6 md:p-8 text-center text-on-surface max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-muted hover:text-on-surface p-1 rounded-full bg-surface-container-low hover:bg-surface-container transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-500 mb-5 shadow-sm">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <h3 className="text-2xl font-bold text-on-surface mb-2">Welcome to {clubName}!</h3>
        <p className="text-muted text-sm mb-6">
          You are now an official member of <span className="text-primary font-medium">{clubName}</span>. Stay connected with the community and receive real-time updates:
        </p>

        {(whatsappGroupLink || whatsappQrCodeUrl) ? (
          <div className="p-5 rounded-2xl bg-surface-container-low border border-border-subtle mb-6 flex flex-col items-center space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
              <MessageCircle className="w-5 h-5" />
              <span>Official WhatsApp Community</span>
            </div>

            {whatsappQrCodeUrl && (
              <div className="relative w-48 h-48 bg-white p-2 rounded-xl shadow-md border border-border-subtle">
                <img
                  src={whatsappQrCodeUrl}
                  alt={`${clubName} WhatsApp QR Code`}
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
            )}

            {whatsappGroupLink && (
              <a
                href={whatsappGroupLink.startsWith("http") ? whatsappGroupLink : `https://${whatsappGroupLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl shadow-sm transition duration-150 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Join WhatsApp Group</span>
                <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
              </a>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-surface-container-low border border-border-subtle text-muted text-xs mb-6">
            The club administrators have not yet provided an official WhatsApp group link. You will receive updates via the portal and email.
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 bg-surface-container-low hover:bg-surface-container text-on-surface font-medium rounded-xl border border-border-subtle transition"
        >
          Done
        </button>
      </div>
    </div>
  );
}
