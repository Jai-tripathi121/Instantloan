import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function isConfigured() {
  return (
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== "placeholder"
  );
}

export async function uploadDocument(file: File, path: string): Promise<string> {
  if (!isConfigured()) return "";
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

async function tryUpload(file: File | null, path: string): Promise<string | undefined> {
  if (!file) return undefined;
  try { return await uploadDocument(file, path); } catch { return undefined; }
}

export async function uploadApplicationDocs(
  applicationId: string,
  aadhaar: File | null,
  panCard: File | null,
  photo: File | null
) {
  const [aadhaarUrl, panCardUrl, photoUrl] = await Promise.all([
    tryUpload(aadhaar, `applications/${applicationId}/aadhaar`),
    tryUpload(panCard, `applications/${applicationId}/pan`),
    tryUpload(photo, `applications/${applicationId}/photo`),
  ]);
  const urls: { aadhaarUrl?: string; panCardUrl?: string; photoUrl?: string } = {};
  if (aadhaarUrl) urls.aadhaarUrl = aadhaarUrl;
  if (panCardUrl) urls.panCardUrl = panCardUrl;
  if (photoUrl) urls.photoUrl = photoUrl;
  return urls;
}
