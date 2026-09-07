"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFeedPost } from "@/app/actions/feed";
import { PostType } from "@/generated/prisma/enums";
import { CldUploadWidget } from "next-cloudinary";
import {
  X,
  ImagePlus,
  Loader2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";

const CATEGORIES: { value: PostType; label: string }[] = [
  { value: "ANNOUNCEMENT", label: "Announcement" },
  { value: "EVENT_RECAP", label: "Event Recap" },
  { value: "CONGRATULATIONS", label: "Congrats" },
];

export default function CreatePostClient() {
  const router = useRouter();
  const [postType, setPostType] = useState<PostType>("ANNOUNCEMENT");
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [published, setPublished] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await createFeedPost({
        content,
        postType,
        imageUrls,
      });
      if (result.success) {
        setPublished(true);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to create post. Are you logged in as a Club?");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addImage = (url: string) => {
    setImageUrls((prev) => (prev.length < 5 ? [...prev, url] : prev));
  };

  const removeImage = (idx: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Success screen ──
  if (published) {
    return (
      <div className="max-w-2xl mx-auto py-6">
        <div className="bg-surface-container-low rounded-2xl border border-outline-variant shadow-sm p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-headline-md font-headline-md text-on-surface mb-2">
            Post Published!
          </h1>
          <p className="text-secondary text-body-md mb-8">
            Your update is now live on the club feed.
          </p>
          <button
            onClick={() => router.push("/feed")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-container transition-colors"
          >
            View Feed
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-headline-lg font-headline-lg text-on-surface mb-1">
          New Post
        </h1>
        <p className="text-secondary text-body-md">
          Share an update with your members — keep it simple.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-surface-container-low rounded-2xl border border-outline-variant shadow-sm overflow-hidden"
      >
        {/* Category tabs */}
        <div className="flex gap-2 px-5 pt-5 pb-4 border-b border-outline-variant">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setPostType(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                postType === cat.value
                  ? "bg-primary text-white shadow-sm border border-primary"
                  : "bg-white text-secondary hover:text-on-surface border border-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Text */}
        <div className="px-5 pt-5">
          <textarea
            required
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post… (Markdown supported)"
            className="w-full bg-transparent resize-none text-body-lg text-on-surface placeholder:text-muted focus:outline-none"
          />
        </div>

        {/* Images */}
        {imageUrls.length > 0 && (
          <div className="px-5 grid grid-cols-5 gap-3 pb-2">
            {imageUrls.map((url, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-xl overflow-hidden border border-outline-variant bg-white"
              >
                <Image
                  src={url}
                  alt={`Upload ${idx + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  aria-label="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-outline-variant">
          <CldUploadWidget
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "demo"}
            options={{ maxFiles: 5 }}
            onSuccess={(result: any) => {
              if (result?.info?.secure_url) addImage(result.info.secure_url);
            }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                disabled={imageUrls.length >= 5}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-outline-variant bg-white text-sm font-medium text-secondary hover:text-primary hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ImagePlus className="w-4 h-4" />
                {imageUrls.length >= 5
                  ? "Max 5 images"
                  : "Add image"}
              </button>
            )}
          </CldUploadWidget>

          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing…
              </>
            ) : (
              "Publish"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
