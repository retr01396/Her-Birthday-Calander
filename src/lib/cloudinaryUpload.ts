/**
 * Upload an image Blob (e.g. a cropped avatar) to Cloudinary using the
 * unsigned upload endpoint, returning the secure URL. Requires
 * NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.
 *
 * @param filename - public filename (without extension). Give each upload a
 *   unique name so Cloudinary doesn't overwrite a previous image with the same
 *   id. Defaults to "avatar" for backwards compatibility.
 * @param folder - Cloudinary folder. Defaults to "campushub/roster".
 */
export async function uploadImageBlob(
  blob: Blob,
  filename: string = "avatar",
  folder: string = "campushub/roster"
): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary is not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to .env"
    );
  }

  const form = new FormData();
  form.append("file", blob, `${filename}.jpg`);
  form.append("upload_preset", uploadPreset);
  form.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: form }
  );

  const data = await res.json();
  if (!res.ok || !data.secure_url) {
    throw new Error(data?.error?.message || "Image upload failed. Try again.");
  }
  return data.secure_url as string;
}
