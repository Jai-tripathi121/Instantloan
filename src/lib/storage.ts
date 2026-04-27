import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function isConfigured() {
  return (
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== "placeholder"
  );
}

/** Race an upload against a 6-second timeout — resolves undefined if either fails or times out */
async function tryUpload(file: File | null, path: string): Promise<string | undefined> {
  if (!file || !isConfigured()) return undefined;
  const timeout = new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), 6000));
  const upload = (async () => {
    try {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch {
      return undefined;
    }
  })();
  return Promise.race([upload, timeout]);
}

export async function uploadApplicationDocs(
  applicationId: string,
  aadhaar: File | null,
  panCard: File | null,
  photo: File | null
) {
  const [aadhaarUrl, panCardUrl, photoUrl] = await Promise.all([
    tryUpload(aadhaar,  `applications/${applicationId}/aadhaar`),
    tryUpload(panCard,  `applications/${applicationId}/pan`),
    tryUpload(photo,    `applications/${applicationId}/photo`),
  ]);
  const urls: { aadhaarUrl?: string; panCardUrl?: string; photoUrl?: string } = {};
  if (aadhaarUrl) urls.aadhaarUrl = aadhaarUrl;
  if (panCardUrl) urls.panCardUrl = panCardUrl;
  if (photoUrl)   urls.photoUrl   = photoUrl;
  return urls;
}
