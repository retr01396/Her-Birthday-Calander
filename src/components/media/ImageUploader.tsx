"use client";

import { useState } from "react";
import {
  CldUploadWidget,
  type CloudinaryUploadWidgetInfo,
  type CloudinaryUploadWidgetResults,
} from "next-cloudinary";
import {
  CloudUpload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ImagePlus,
  Trash2,
} from "lucide-react";

interface ImageUploaderProps {
  /**
   * Called with the secure Cloudinary URL after a successful upload.
   * Passes an empty string when the user removes the image.
   */
  onUploadSuccess?: (url: string) => void;
  /** Existing image URL used to seed the preview (e.g. a saved club logo). */
  value?: string | null;
  /**
   * When provided, renders a hidden <input name={inputName}> so plain
   * HTML/server-action forms can submit the uploaded URL without extra wiring.
   */
  inputName?: string;
  /** Label shown on the primary upload button. */
  buttonLabel?: string;
  /** Helper text displayed beneath the upload area. */
  hint?: string;
  /** Extra classes for the outer wrapper. */
  className?: string;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

/** Extract the secure Cloudinary URL from a widget result. */
function getSecureUrl(result: CloudinaryUploadWidgetResults): string | null {
  const info = result?.info;
  if (typeof info === "object" && info !== null && "secure_url" in info) {
    return (info as CloudinaryUploadWidgetInfo).secure_url || null;
  }
  return null;
}

export default function ImageUploader({
  onUploadSuccess,
  value,
  inputName,
  buttonLabel = "Upload Image",
  hint,
  className = "",
}: ImageUploaderProps) {
  const [status, setStatus] = useState<UploadStatus>(
    value ? "success" : "idle"
  );
  const [errorText, setErrorText] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value ?? null);

  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  const emitUrl = (url: string) => {
    setPreviewUrl(url || null);
    onUploadSuccess?.(url);
  };

  const handleSuccess = (result: CloudinaryUploadWidgetResults) => {
    const url = getSecureUrl(result);
    if (url) {
      setStatus("success");
      setErrorText(null);
      emitUrl(url);
    } else {
      setStatus("error");
      setErrorText(
        "Upload completed but no image URL was returned. Please try again."
      );
    }
  };

  const handleError = (error: unknown) => {
    setStatus("error");
    setErrorText(
      error instanceof Error
        ? error.message
        : "Upload failed. Please try again."
    );
  };

  const handleRemove = () => {
    setStatus("idle");
    setErrorText(null);
    emitUrl("");
  };

  // Hidden input so server-action forms can read the uploaded URL via formData.
  const hiddenInput = inputName ? (
    <input type="hidden" name={inputName} value={previewUrl ?? ""} />
  ) : null;

  // Graceful fallback when Cloudinary isn't configured yet.
  if (!uploadPreset || !cloudName) {
    return (
      <div className={className}>
        {hiddenInput}
        <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4 text-xs text-amber-800">
          <p className="font-bold flex items-center gap-1.5">
            <AlertCircle size={14} className="shrink-0" />
            Cloudinary is not configured
          </p>
          <p className="mt-1 leading-relaxed">
            Add <code className="font-mono">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code>{" "}
            and{" "}
            <code className="font-mono">NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code>{" "}
            to your <code className="font-mono">.env</code> file to enable image
            uploads.
          </p>
        </div>
      </div>
    );
  }

  const hasImage = !!previewUrl && status === "success";

  return (
    <div className={className}>
      {hiddenInput}

      <CldUploadWidget
        uploadPreset={uploadPreset}
        options={{
          folder: "campushub",
          maxFiles: 1,
          clientAllowedFormats: ["image"],
        }}
        onUploadAdded={() => setStatus("uploading")}
        onSuccess={handleSuccess}
        onError={handleError}
        onClose={() =>
          setStatus((prev) => (prev === "uploading" ? "idle" : prev))
        }
      >
        {({ open }) => (
          <div className="space-y-3">
            {/* Uploaded image preview */}
            {hasImage ? (
              <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Uploaded preview"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => open()}
                    className="px-3.5 py-1.5 bg-white text-slate-900 text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="px-3.5 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                </div>
                <span className="absolute top-2.5 right-2.5 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <CheckCircle2 size={11} />
                  Uploaded
                </span>
              </div>
            ) : (
              /* Upload trigger with dynamic status */
              <button
                type="button"
                onClick={() => open()}
                disabled={status === "uploading"}
                className="w-full flex items-center justify-center gap-2.5 px-5 py-6 rounded-xl border-2 border-dashed border-slate-300 text-sm font-semibold text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {status === "uploading" ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-primary" />
                    Uploading...
                  </>
                ) : status === "error" ? (
                  <>
                    <AlertCircle size={18} className="text-red-500" />
                    Upload Failed — Try Again
                  </>
                ) : (
                  <>
                    <CloudUpload size={18} className="group-hover:scale-110 transition-transform" />
                    {buttonLabel}
                  </>
                )}
              </button>
            )}

            {hasImage && (
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <ImagePlus size={12} />
                Hover the image to replace or remove it.
              </p>
            )}

            {status === "error" && errorText && (
              <p className="text-xs text-red-600 font-medium flex items-start gap-1.5">
                <AlertCircle size={13} className="shrink-0 mt-0.5" />
                {errorText}
              </p>
            )}

            {hint && !hasImage && status !== "error" && (
              <p className="text-[11px] text-slate-400">{hint}</p>
            )}
          </div>
        )}
      </CldUploadWidget>
    </div>
  );
}
