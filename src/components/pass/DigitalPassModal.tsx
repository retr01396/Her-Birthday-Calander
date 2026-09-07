"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";

export function DigitalPassModal({
  isOpen,
  onClose,
  registration,
  event,
  studentName,
}: {
  isOpen: boolean;
  onClose: () => void;
  registration: { qrToken: string; id: string };
  event: { title: string; startDate: Date; location: string };
  studentName?: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm rounded-2xl bg-surface border border-border-subtle p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted hover:bg-canvas hover:text-on-surface transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center text-center mt-4">
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
            Verified Pass
          </div>
          
          <h2 className="text-2xl font-black text-on-surface mb-2">{event.title}</h2>
          
          {studentName && (
            <p className="text-md font-medium text-on-surface/80 mb-2">{studentName}</p>
          )}

          <div className="text-sm text-muted mb-6 flex flex-col gap-1">
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(event.startDate).toLocaleString()}
            </span>
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {event.location}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm mb-6 border border-gray-100">
            <QRCodeSVG value={registration.qrToken} size={220} level="H" />
          </div>

          <p className="text-xs text-muted font-mono bg-canvas px-3 py-1.5 rounded-md">
            ID: {registration.id}
          </p>
        </div>
      </div>
    </div>
  );
}
