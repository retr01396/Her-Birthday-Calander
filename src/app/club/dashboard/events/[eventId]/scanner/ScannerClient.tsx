"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { markAttendance } from "@/app/actions/eventActions";
import { ArrowLeft, CheckCircle2, AlertCircle, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ClubEventScannerClient({
  eventId,
  isClosed,
  eventTitle,
}: {
  eventId: string;
  isClosed: boolean;
  eventTitle: string;
}) {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanDetails, setScanDetails] = useState<{ name: string, email: string, externalPassCode: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const processingRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    // Finalized events are permanently locked — no scanning.
    if (isClosed) return;

    // Prevent multiple instances on hot-reload
    const scannerId = "reader";
    const scannerElement = document.getElementById(scannerId);

    if (scannerElement && !scannerElement.hasChildNodes()) {
      const scanner = new Html5QrcodeScanner(
        scannerId,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render(
        async (decodedText) => {
          if (processingRef.current) return;

          processingRef.current = true;
          setProcessing(true);
          setScanResult(null);
          setError(null);

          try {
            // decodedText is expected to be the qrToken
            const res = await markAttendance(decodedText, eventId);
            if (res.success) {
              setScanResult(res.message);
              setScanDetails({
                name: res.studentName || "Student",
                email: res.studentEmail || "No Email",
                externalPassCode: res.externalPassCode || null,
              });
              // Clear success message after 5 seconds so they can scan next
              setTimeout(() => {
                setScanResult(null);
                setScanDetails(null);
                setProcessing(false);
                processingRef.current = false;
              }, 5000);
            }
          } catch (err: any) {
            setError(err.message || "Failed to mark attendance.");
            setTimeout(() => {
              setError(null);
              setProcessing(false);
              processingRef.current = false;
            }, 3000);
          }
        },
        (err) => {
          // Ignore frequent scan failures (when no QR is detected)
        }
      );

      return () => {
        scanner.clear().catch(console.error);
      };
    }
  }, [eventId, isClosed]);

  return (
    <div className="min-h-screen bg-canvas p-6 md:p-12">
      <div className="max-w-xl mx-auto">
        <button
          onClick={() => router.push("/club/dashboard")}
          className="flex items-center gap-2 text-muted hover:text-on-surface mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Club Dashboard
        </button>

        <div className="bg-surface rounded-2xl p-8 shadow-sm border border-border-subtle">
          <h1 className="text-2xl font-black text-on-surface mb-2">Event Scanner</h1>
          <p className="text-muted text-sm mb-8">
            Point your camera at a student's digital pass to record attendance.
          </p>

          {isClosed ? (
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-8 text-center mb-6">
              <Lock size={32} className="mx-auto text-amber-600 mb-3" />
              <h2 className="text-lg font-black text-amber-800 mb-1">
                Scanner Locked
              </h2>
              <p className="text-sm text-amber-700">
                <strong>{eventTitle}</strong> has been finalized — attendance is
                permanently closed and points have been awarded.
              </p>
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden mb-6 border-2 border-primary/20">
              <div id="reader" className="w-full" />
            </div>
          )}

          <div className="h-24 flex items-center justify-center">
            {processing && !scanResult && !error && (
              <div className="flex items-center gap-2 text-primary">
                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                <span className="font-bold">Verifying Pass...</span>
              </div>
            )}

            {scanResult && scanDetails && (
              <div className="flex flex-col items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-xl font-bold animate-in zoom-in fade-in w-full justify-center text-center">
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 size={24} />
                  <span>{scanResult}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-emerald-100 w-full space-y-1">
                  <p className="text-sm text-slate-800">
                    <span className="text-slate-500 uppercase tracking-wider text-[10px]">Name:</span> {scanDetails.name}
                  </p>
                  <p className="text-sm text-slate-800">
                    <span className="text-slate-500 uppercase tracking-wider text-[10px]">Email:</span> {scanDetails.email}
                  </p>
                  {scanDetails.externalPassCode && (
                    <p className="text-sm text-slate-800 pt-2 mt-2 border-t border-slate-100">
                      <span className="text-slate-500 uppercase tracking-wider text-[10px]">Submitted Pass Code:</span> 
                      <code className="ml-2 font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                        {scanDetails.externalPassCode}
                      </code>
                    </p>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 bg-red-50 text-red-600 px-6 py-4 rounded-xl font-bold animate-in zoom-in fade-in w-full justify-center">
                <AlertCircle size={24} />
                {error}
              </div>
            )}

            {!processing && !scanResult && !error && !isClosed && (
              <p className="text-muted text-sm font-medium">Ready to scan next pass.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
