// Firebase client SDK init. Used in Client Components only.
// Server components / server actions go through src/lib/firebase/server.ts.
//
// Reads the public NEXT_PUBLIC_FIREBASE_* env vars (safe to expose).
//
// In dev, set NEXT_PUBLIC_USE_FIREBASE_EMULATORS=1 to point Auth and
// Firestore at the local emulator suite (ports 9099 and 8080).

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getOrInitApp(): FirebaseApp {
  if (getApps().length) return getApp();
  if (!firebaseConfig.apiKey) {
    throw new Error(
      "Firebase client config missing. Set NEXT_PUBLIC_FIREBASE_* env vars (.env.local or Vercel project env).",
    );
  }
  return initializeApp(firebaseConfig);
}

let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

export function getClientAuth(): Auth {
  if (_auth) return _auth;
  const app = getOrInitApp();
  _auth = getAuth(app);
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "1" && typeof window !== "undefined") {
    connectAuthEmulator(_auth, "http://127.0.0.1:9099", { disableWarnings: true });
  }
  return _auth;
}

export function getClientDb(): Firestore {
  if (_db) return _db;
  const app = getOrInitApp();
  _db = getFirestore(app);
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "1" && typeof window !== "undefined") {
    connectFirestoreEmulator(_db, "127.0.0.1", 8080);
  }
  return _db;
}

export function getClientStorage(): FirebaseStorage {
  if (_storage) return _storage;
  const app = getOrInitApp();
  _storage = getStorage(app);
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "1" && typeof window !== "undefined") {
    connectStorageEmulator(_storage, "127.0.0.1", 9199);
  }
  return _storage;
}
