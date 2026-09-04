const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const isCloudinaryConfigured = Boolean(cloudName && uploadPreset);

/** Upload one image via Cloudinary unsigned preset. Returns secure HTTPS URL. */
export async function uploadToCloudinary(file) {
  if (!isCloudinaryConfigured) {
    throw new Error('Image upload is not configured on this site.');
  }

  const body = new FormData();
  body.append('file', file);
  body.append('upload_preset', uploadPreset);
  body.append('folder', 'stay-watch/evidence');

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body }
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error?.message || `Upload failed (${res.status})`);
  }
  if (!data.secure_url) {
    throw new Error('Upload succeeded but no URL was returned.');
  }
  return data.secure_url;
}

/** Upload multiple files in parallel. */
export async function uploadEvidenceFiles(files) {
  return Promise.all(files.filter(Boolean).map(uploadToCloudinary));
}
