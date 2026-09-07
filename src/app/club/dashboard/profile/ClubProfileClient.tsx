"use client";

import React, { useState, useRef } from "react";
import {
  Building2,
  Image as ImageIcon,
  MessageCircle,
  QrCode,
  Save,
  CheckCircle2,
  Upload,
  Crop,
  AlertCircle,
  FileText,
  Tag,
  Users
} from "lucide-react";
import ImageCropper from "@/components/ImageCropper";
import FeedbackModal from "@/components/FeedbackModal";
import { updateClubProfile } from "@/app/actions/clubDashboardActions";

interface ClubProfileClientProps {
  club: {
    id: string;
    name: string;
    slug: string | null;
    username: string;
    tagline?: string | null;
    logoUrl?: string | null;
    coverUrl?: string | null;
    about?: string | null;
    recruitmentStatus: string;
    whatsappGroupUrl?: string | null;
  };
}

export default function ClubProfileClient({ club }: ClubProfileClientProps) {
  const [tagline, setTagline] = useState(club.tagline || "");
  const [logoUrl, setLogoUrl] = useState(club.logoUrl || "");
  const [bannerUrl, setBannerUrl] = useState(club.coverUrl || "");
  const [aboutMarkdown, setAboutMarkdown] = useState(club.about || "");
  const [recruitmentStatus, setRecruitmentStatus] = useState<string>(
    club.recruitmentStatus || "OPEN_FOR_MEMBERS"
  );
  const [whatsappGroupLink, setWhatsappGroupLink] = useState(club.whatsappGroupUrl || "");
  const [whatsappQrCodeUrl, setWhatsappQrCodeUrl] = useState("");

  // Cropper states
  const [cropperModal, setCropperModal] = useState<{
    isOpen: boolean;
    imageSrc: string;
    aspectRatio: number;
    target: "logo" | "banner" | "qr";
    title: string;
  }>({
    isOpen: false,
    imageSrc: "",
    aspectRatio: 1,
    target: "logo",
    title: "Crop Image",
  });

  const logoFileRef = useRef<HTMLInputElement>(null);
  const bannerFileRef = useRef<HTMLInputElement>(null);
  const qrFileRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSelectFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "logo" | "banner" | "qr"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setCropperModal({
        isOpen: true,
        imageSrc: src,
        aspectRatio: target === "banner" ? 16 / 9 : 1,
        target,
        title:
          target === "logo"
            ? "Crop Club Logo (1:1 Square)"
            : target === "banner"
            ? "Crop Club Cover Banner (16:9 Widescreen)"
            : "Crop WhatsApp QR Code (1:1)",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedBlob: Blob, previewUrl: string) => {
    // In production, upload to storage API / Cloudinary
    // Convert to persistent data URL for immediate save and storage
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result as string;
      if (cropperModal.target === "logo") {
        setLogoUrl(base64Url);
      } else if (cropperModal.target === "banner") {
        setBannerUrl(base64Url);
      } else if (cropperModal.target === "qr") {
        setWhatsappQrCodeUrl(base64Url);
      }
    };
    reader.readAsDataURL(croppedBlob);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await updateClubProfile({
        clubId: club.id,
        tagline,
        logoUrl,
        bannerUrl,
        aboutMarkdown,
        recruitmentStatus,
      });

      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || "Failed to save club profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1.5">
            <Building2 className="w-4 h-4" />
            <span>Club Settings</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">{club.name} Profile</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your club branding, image crops (1:1 Logo, 16:9 Banner), WhatsApp group links, and recruitment status.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-400 self-start sm:self-auto">
          @{club.username}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Visual Branding & Image Croppers */}
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-indigo-400" />
              <span>Branding & Visual Identity</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Upload and crop images to exact dimensions before saving to ensure crisp presentation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1:1 Logo Cropper */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Club Logo (1:1 Aspect Ratio)
              </label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center relative flex-shrink-0 shadow-md">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Club Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-10 h-10 text-slate-600" />
                  )}
                </div>

                <div className="space-y-2">
                  <input
                    ref={logoFileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleSelectFile(e, "logo")}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoFileRef.current?.click()}
                    className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
                  >
                    <Crop className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Upload & Crop Logo (1:1)</span>
                  </button>
                  <p className="text-[11px] text-slate-400">Square avatar for club directory and cards.</p>
                </div>
              </div>
            </div>

            {/* 16:9 Banner Cropper */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Cover Banner (16:9 Widescreen)
              </label>
              <div className="space-y-2">
                <div className="w-full h-24 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center relative shadow-md">
                  {bannerUrl ? (
                    <img src={bannerUrl} alt="Cover Banner" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-600" />
                  )}
                </div>

                <input
                  ref={bannerFileRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleSelectFile(e, "banner")}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => bannerFileRef.current?.click()}
                  className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
                >
                  <Crop className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Upload & Crop Banner (16:9)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Community Integration */}
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <span>WhatsApp Community Integration</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Provide your club&apos;s WhatsApp invite link and QR code. Students will see these immediately upon joining!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                WhatsApp Group Invite Link
              </label>
              <div className="relative">
                <MessageCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="url"
                  value={whatsappGroupLink}
                  onChange={(e) => setWhatsappGroupLink(e.target.value)}
                  placeholder="https://chat.whatsapp.com/..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                WhatsApp QR Code Image
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white p-1.5 border border-slate-700 flex items-center justify-center flex-shrink-0 shadow-md">
                  {whatsappQrCodeUrl ? (
                    <img src={whatsappQrCodeUrl} alt="WhatsApp QR" className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <QrCode className="w-8 h-8 text-slate-400" />
                  )}
                </div>

                <div className="space-y-2">
                  <input
                    ref={qrFileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleSelectFile(e, "qr")}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => qrFileRef.current?.click()}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Upload QR Image</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* General Club Information */}
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <span>Club Info & Recruitment</span>
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Tagline / Motto
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Empowering innovators through code and hardware."
                className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Recruitment Status
              </label>
              <select
                value={recruitmentStatus}
                onChange={(e) => setRecruitmentStatus(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none cursor-pointer"
              >
                <option value="OPEN_FOR_MEMBERS" className="bg-slate-900 text-white">
                  OPEN_FOR_MEMBERS (Students can join via portal)
                </option>
                <option value="CLOSED" className="bg-slate-900 text-white">
                  CLOSED (Recruitment is currently closed)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                About Club (Markdown Support)
              </label>
              <textarea
                rows={6}
                value={aboutMarkdown}
                onChange={(e) => setAboutMarkdown(e.target.value)}
                placeholder="Write about your club missions, events, achievements, and leadership..."
                className="w-full p-4 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="py-3 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition duration-150 flex items-center gap-2 active:scale-95 disabled:opacity-50 text-sm"
          >
            {saving ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Image Cropper Modal */}
      <ImageCropper
        isOpen={cropperModal.isOpen}
        onClose={() => setCropperModal({ ...cropperModal, isOpen: false })}
        imageSrc={cropperModal.imageSrc}
        aspectRatio={cropperModal.aspectRatio}
        title={cropperModal.title}
        onCropComplete={handleCropComplete}
      />

      {/* Save Feedback Modal */}
      <FeedbackModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Changes Saved Successfully!"
        message="Your club profile details, branding images, and WhatsApp community links have been updated across CampusHub."
        type="success"
      />
    </div>
  );
}
