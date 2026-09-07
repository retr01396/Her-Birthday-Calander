"use client";

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { X, Check, ZoomIn, ZoomOut, RotateCw } from "lucide-react";

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  aspectRatio: number; // 1 for 1:1, 16/9 for 16:9
  title?: string;
  onCropComplete: (croppedBlob: Blob, previewUrl: string) => void;
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<{ blob: Blob; url: string }> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (error) => reject(error));
    img.setAttribute("crossOrigin", "anonymous");
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  const rotRad = (rotation * Math.PI) / 180;

  // Calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = {
    width: Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height),
    height: Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height),
  };

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");

  if (!croppedCtx) {
    throw new Error("No cropped 2d context");
  }

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      const url = URL.createObjectURL(blob);
      resolve({ blob, url });
    }, "image/jpeg", 0.95);
  });
}

export default function ImageCropper({
  isOpen,
  onClose,
  imageSrc,
  aspectRatio,
  title = "Crop Image",
  onCropComplete,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onCropCompleteCallback = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = async () => {
    if (!croppedAreaPixels || !imageSrc) return;
    try {
      setIsProcessing(true);
      const { blob, url } = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      onCropComplete(blob, url);
      onClose();
    } catch (e) {
      console.error("Error cropping image:", e);
      alert("Failed to crop image.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-surface border border-border-subtle rounded-3xl shadow-xl overflow-hidden flex flex-col text-on-surface max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <div>
            <h3 className="text-lg font-bold text-on-surface">{title}</h3>
            <p className="text-xs text-muted">
              {aspectRatio === 1 ? "Enforcing 1:1 Square aspect ratio" : "Enforcing 16:9 Widescreen aspect ratio"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-on-surface p-1 rounded-full bg-surface-container-low hover:bg-surface-container transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper Container — dark canvas gives contrast against the image */}
        <div className="relative w-full h-[400px] bg-slate-950">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteCallback}
            onZoomChange={setZoom}
          />
        </div>

        {/* Controls */}
        <div className="p-6 bg-surface border-t border-border-subtle space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <ZoomOut className="w-4 h-4 text-muted" />
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-label="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1.5 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <ZoomIn className="w-4 h-4 text-muted" />
            </div>

            <button
              type="button"
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-xs font-medium text-on-surface transition"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Rotate
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-border-subtle bg-surface-container-low text-on-surface hover:bg-surface-container font-medium text-sm transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-medium text-sm shadow-sm transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {isProcessing ? "Processing..." : "Apply Crop"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
