"use client";

import { useRef, useState } from "react";
import {
  CloudUpload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ImagePlus,
  Trash2,
} from "lucide-react";
import ImageCropper from "@/components/ImageCropper";
import { uploadImageBlob } from "@/lib/cloudinaryUpload";

interface CropImageUploaderProps {
  /** Existing image URL used to seed the preview (e.g. a saved club logo). */
  value?: string | null;
  /** Called with the Cloudinary URL after a successful crop + upload. */
  onUploadSuccess: (url: string) => void;
  /** 1 for a 1:1 square logo, 16/9 for a widescreen banner. */
  aspectRatio: number;
  /** Title shown in the crop dialog. */
  title?: string;
  /** Label shown on the primary upload button. */
  buttonLabel?: string;
  /** Helper text displayed beneath the upload area. */
  hint?: string;
}

/**
 * Image uploader with an integrated crop/resize step and live preview.
 * Picking a file opens the crop dialog locked to the requested aspect ratio;
 * applying the crop uploads the resulting image to Cloudinary and reports the
 * final URL through onUploadSuccess.
 */
export default function CropImageUploader({
  value,
  onUploadSuccess,
  aspectRatio,
  title,
  buttonLabel = "Upload Image",
  hint,
}: CropImageUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  // Source image currently sitting in the crop dialog.
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [errorText, setErrorText] = useState<string | null>(null);

  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCropSrc(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    // Allow re-selecting the same file after cancel/retry.
    e.target.value = "";
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setStatus("uploading");
    setErrorText(null);
    try {
      // Unique filename per upload so club logo/banner don't overwrite each
      // other (Cloudinary derives the public id from the uploaded filename).
      const kind = aspectRatio === 1 ? "logo" : "banner";
      const url = await uploadImageBlob(
        croppedBlob,
        `club-${kind}-${Date.now()}`,
        "campushub/clubs"
      );
      onUploadSuccess(url);
      setStatus("idle");
    } catch (err: any) {
      setStatus("error");
      setErrorText(
        err instanceof Error
          ? err.message
          : "Upload failed. Please try again."
      );
    }
  };

  const handleRemove = () => {
    onUploadSuccess("");
    setStatus("idle");
    setErrorText(null);
  };

  // Graceful fallback when Cloudinary isn't configured yet.
  if (!uploadPreset || !cloudName) {
    return (
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
    );
  }

  const hasImage = !!value;

  return (
    <div className="space-y-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {hasImage ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Uploaded preview"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
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
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
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

      {/* Crop dialog — locked to the requested aspect ratio */}
      <ImageCropper
        isOpen={!!cropSrc}
        onClose={() => setCropSrc(null)}
        imageSrc={cropSrc || ""}
        aspectRatio={aspectRatio}
        title={
          title ||
          (aspectRatio === 1
            ? "Crop Image (1:1 Square)"
            : "Crop Image (16:9 Widescreen)")
        }
        onCropComplete={(blob) => {
          handleCropComplete(blob);
          setCropSrc(null);
        }}
      />
    </div>
  );
}
