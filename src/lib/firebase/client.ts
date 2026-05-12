"use client";

import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

export type FirebaseClient = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
};

let clientPromise: Promise<FirebaseClient | null> | null = null;

/**
 * Lazy-loads Firebase SDKs in a single shared chunk after first call.
 * Keeps the main bundle smaller for faster first paint / TTI.
 */
export function loadFirebaseClient(): Promise<FirebaseClient | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    return Promise.resolve(null);
  }

  if (!clientPromise) {
    clientPromise = (async () => {
      const [{ initializeApp, getApps, getApp }, { getAuth }, { getFirestore }] =
        await Promise.all([
          import("firebase/app"),
          import("firebase/auth"),
          import("firebase/firestore"),
        ]);

      try {
        const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        return {
          app,
          auth: getAuth(app),
          db: getFirestore(app),
        };
      } catch {
        return null;
      }
    })();
  }

  return clientPromise;
}
