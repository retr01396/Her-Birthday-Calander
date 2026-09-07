"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClubByAdmin } from "@/app/actions/adminClub";
import CropImageUploader from "@/components/media/CropImageUploader";
import { KeyRound, Sparkles, Copy, Check } from "lucide-react";

export function AdminClubCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<{
    username: string;
    rawPassword: string;
    slug: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    rawPassword: "",
    tagline: "",
    category: "GENERAL" as "PROFESSIONAL_BODY" | "GENERAL",
    logoUrl: "",
    bannerUrl: "",
    aboutMarkdown: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // Auto-suggest username if name changes and username hasn't been manually set
      if (name === "name" && !prev.username) {
        next.username = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/(^_|_$)+/g, "");
      }
      return next;
    });
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, rawPassword: pass }));
  };

  const autoGenerateUsername = () => {
    if (!formData.name) return;
    const autoUsername = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/(^_|_$)+/g, "");
    setFormData((prev) => ({ ...prev, username: autoUsername }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await createClubByAdmin(formData);
      if (res.success) {
        setCreatedCredentials({
          username: res.username,
          rawPassword: formData.rawPassword,
          slug: res.slug ?? "",
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to create club");
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = () => {
    if (!createdCredentials) return;
    const text = `Club: ${formData.name}\nUsername: ${createdCredentials.username}\nPassword: ${createdCredentials.rawPassword}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (createdCredentials) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <div className="flex items-center gap-3 text-emerald-600 font-bold text-xl">
          <Sparkles size={28} />
          <span>Club Created Successfully!</span>
        </div>
        <p className="text-slate-600">
          Save these login credentials safely. Provide them to the club representative to access their <strong>/club/dashboard</strong>.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm flex items-start gap-3">
          <Sparkles size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <span>
            This club is created as an <strong>unpublished draft</strong>. The club lead must log in and
            complete the setup wizard (details + logo/banner) before clicking
            <strong> Publish Club Profile</strong> — only then does it appear in the public catalog.
          </span>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3 font-mono text-sm">
          <div>
            <span className="text-slate-500 block text-xs">CLUB USERNAME:</span>
            <span className="font-bold text-slate-900">{createdCredentials.username}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-xs">PASSWORD:</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
              {createdCredentials.rawPassword}
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={copyCredentials}
            className="flex-1 bg-slate-900 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? "Copied Credentials!" : "Copy Credentials"}
          </button>
          <button
            onClick={() => router.push("/club/login")}
            className="flex-1 bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-primary/90 transition-colors text-center"
          >
            Go to Club Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl">{error}</div>}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Club Name</label>
          <input
            required
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="e.g. Robotics Club"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-slate-700">Club Username</label>
              <button
                type="button"
                onClick={autoGenerateUsername}
                className="text-xs text-primary font-semibold hover:underline"
              >
                Auto-Fill
              </button>
            </div>
            <input
              required
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-mono"
              placeholder="e.g. robotics_club"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <button
                type="button"
                onClick={generatePassword}
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
              >
                <KeyRound size={12} />
                Generate Random
              </button>
            </div>
            <input
              required
              type="text"
              name="rawPassword"
              value={formData.rawPassword}
              onChange={handleChange}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-mono"
              placeholder="Enter or generate password"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tagline</label>
          <input
            required
            type="text"
            name="tagline"
            value={formData.tagline}
            onChange={handleChange}
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="e.g. Building the future of automation"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none bg-white"
          >
            <option value="GENERAL">General / Student Interest</option>
            <option value="PROFESSIONAL_BODY">Professional Body (IEEE, ACM, etc.)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Logo (Optional)</label>
          <CropImageUploader
            value={formData.logoUrl}
            onUploadSuccess={(url) => setFormData((prev) => ({ ...prev, logoUrl: url }))}
            buttonLabel="Upload Club Logo"
            aspectRatio={1}
            title="Crop Club Logo (1:1 Square)"
            hint="Upload a club logo (PNG, JPG, WebP) — cropped to 1:1 square."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Banner (Optional)</label>
          <CropImageUploader
            value={formData.bannerUrl}
            onUploadSuccess={(url) => setFormData((prev) => ({ ...prev, bannerUrl: url }))}
            buttonLabel="Upload Club Banner"
            aspectRatio={16 / 9}
            title="Crop Club Banner (16:9 Widescreen)"
            hint="Upload a cover banner shown on the public club page — cropped to 16:9."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">About / Description (Optional)</label>
          <textarea
            name="aboutMarkdown"
            value={formData.aboutMarkdown}
            onChange={handleChange}
            rows={5}
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="Detailed description or markdown..."
          />
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white font-bold py-3.5 px-4 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
        >
          {loading ? "Creating Club & Generating Credentials..." : "Create Club Account"}
        </button>
      </div>
    </form>
  );
}
