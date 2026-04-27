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

export async function uploadApplicationDocs(
  applicationId: string,
  aadhaar: File | null,
  panCard: File | null,
  photo: File | null
) {
  const urls: { aadhaarUrl?: string; panCardUrl?: string; photoUrl?: string } = {};
  if (aadhaar) urls.aadhaarUrl = await uploadDocument(aadhaar, `applications/${applicationId}/aadhaar`);
  if (panCard) urls.panCardUrl = await uploadDocument(panCard, `applications/${applicationId}/pan`);
  if (photo) urls.photoUrl = await uploadDocument(photo, `applications/${applicationId}/photo`);
  return urls;
}
