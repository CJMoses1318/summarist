"use client";

import type { User } from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { loadFirebaseClient, type FirebaseClient } from "@/lib/firebase/client";
import type { Book } from "@/types/book";
import type { SubscriptionPlan, UserProfile } from "@/types/user-profile";

type AuthContextValue = {
  firebaseReady: boolean;
  user: User | null;
  profile: UserProfile | null;
  authLoading: boolean;
  logout: () => Promise<void>;
  register: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; message?: string }>;
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; message?: string }>;
  googleLogin: () => Promise<{ ok: boolean; message?: string }>;
  resetPassword: (
    email: string,
  ) => Promise<{ ok: boolean; message?: string }>;
  guestLogin: () => Promise<{ ok: boolean; message?: string }>;
  saveBookToLibrary: (book: Book) => Promise<void>;
  markBookFinished: (bookId: string) => Promise<void>;
};

const emptyProfileState = (): UserProfile => ({
  subscriptionPlan: "basic",
  savedBooks: [],
  finishedBookIds: [],
});

const AuthContext = createContext<AuthContextValue | null>(null);

function mapFirebaseError(error: unknown, mode: "register" | "login"): string {
  const code =
    typeof error === "object" &&
    error &&
    "code" in error &&
    typeof (error as { code?: string }).code === "string"
      ? (error as { code?: string }).code
      : "";

  switch (code) {
    case "auth/invalid-email":
      return "Invalid email.";
    case "auth/weak-password":
      return "Short password.";
    case "auth/user-not-found":
      return mode === "login" ? "User not found." : "Invalid email.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return mode === "login" ? "User not found." : "Something went wrong.";
    case "auth/email-already-in-use":
      return "That email is already registered.";
    default:
      return "Something went wrong. Please try again.";
  }
}

function uniqueBooks(books: Book[]): Book[] {
  const map = new Map<string, Book>();
  for (const b of books) map.set(b.id, b);
  return Array.from(map.values());
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<FirebaseClient | null | undefined>(
    undefined,
  );

  useEffect(() => {
    let cancelled = false;
    void loadFirebaseClient().then((c) => {
      if (!cancelled) setClient(c);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const auth = client?.auth ?? null;
  const db = client?.db ?? null;
  const firebaseResolved = client !== undefined;
  const firebaseReady = Boolean(auth && db);

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  /** Avoids setting authLoading on token refresh (onSnapshot may not re-fire). */
  const authSessionUidRef = useRef<string | null>(null);

  useEffect(() => {
    if (!firebaseResolved) return;
    if (!auth || !db) {
      setAuthLoading(false);
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    void (async () => {
      const [{ onAuthStateChanged }, { doc, getDoc, setDoc, updateDoc, serverTimestamp }] =
        await Promise.all([import("firebase/auth"), import("firebase/firestore")]);
      if (cancelled) return;

      const u = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);

        if (!firebaseUser) {
          authSessionUidRef.current = null;
          setProfile(null);
          setAuthLoading(false);
          return;
        }

        const uid = firebaseUser.uid;
        const sessionChanged = uid !== authSessionUidRef.current;
        authSessionUidRef.current = uid;
        if (sessionChanged) {
          setAuthLoading(true);
        }

        try {
          const ref = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(ref);

          if (!snap.exists()) {
            await setDoc(ref, {
              email: firebaseUser.email,
              subscriptionPlan: "basic",
              savedBooks: [],
              finishedBookIds: [],
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } else if (firebaseUser.email) {
            await updateDoc(ref, {
              email: firebaseUser.email,
              updatedAt: serverTimestamp(),
            });
          }
        } catch {
          // ignore—rules may block until deploy
        }
      });
      if (cancelled) {
        u();
        return;
      }
      unsubscribe = u;
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [firebaseResolved, auth, db]);

  useEffect(() => {
    if (!user || !db) return;

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    void (async () => {
      const { doc, onSnapshot } = await import("firebase/firestore");
      if (cancelled) return;

      const ref = doc(db, "users", user.uid);

      const u = onSnapshot(
        ref,
        (snapshot) => {
          if (!snapshot.exists()) {
            setProfile(emptyProfileState());
            setAuthLoading(false);
            return;
          }

          const data = snapshot.data() as Partial<UserProfile>;
          const plan = (["basic", "premium", "premium-plus"] as const).includes(
            data.subscriptionPlan as SubscriptionPlan,
          )
            ? (data.subscriptionPlan as SubscriptionPlan)
            : "basic";

          setProfile({
            subscriptionPlan: plan,
            savedBooks: Array.isArray(data.savedBooks)
              ? (data.savedBooks as Book[])
              : [],
            finishedBookIds: Array.isArray(data.finishedBookIds)
              ? (data.finishedBookIds as string[])
              : [],
            stripeCustomerId: data.stripeCustomerId,
          });
          setAuthLoading(false);
        },
        () => {
          setProfile(emptyProfileState());
          setAuthLoading(false);
        },
      );
      if (cancelled) {
        u();
        return;
      }
      unsubscribe = u;
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [user, db]);

  const logout = useCallback(async () => {
    if (!auth) return;
    const { signOut } = await import("firebase/auth");
    await signOut(auth);
  }, [auth]);

  const register = useCallback(
    async (email: string, password: string) => {
      if (!auth)
        return { ok: false as const, message: "Firebase not configured." };
      try {
        const { createUserWithEmailAndPassword } = await import("firebase/auth");
        await createUserWithEmailAndPassword(auth, email, password);
        return { ok: true as const };
      } catch (e) {
        return {
          ok: false as const,
          message: mapFirebaseError(e, "register"),
        };
      }
    },
    [auth],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      if (!auth)
        return { ok: false as const, message: "Firebase not configured." };
      try {
        const { signInWithEmailAndPassword } = await import("firebase/auth");
        await signInWithEmailAndPassword(auth, email, password);
        return { ok: true as const };
      } catch (e) {
        return { ok: false as const, message: mapFirebaseError(e, "login") };
      }
    },
    [auth],
  );

  const googleLogin = useCallback(async () => {
    if (!auth)
      return { ok: false as const, message: "Firebase not configured." };
    try {
      const { signInWithPopup, GoogleAuthProvider } = await import("firebase/auth");
      await signInWithPopup(auth, new GoogleAuthProvider());
      return { ok: true as const };
    } catch (e) {
      const code =
        typeof e === "object" &&
        e &&
        "code" in e &&
        typeof (e as { code?: string }).code === "string"
          ? (e as { code: string }).code
          : "";
      if (code === "auth/operation-not-allowed") {
        return {
          ok: false as const,
          message:
            "Google sign-in is not enabled for this Firebase project. In the Firebase console, open Authentication → Sign-in method and turn on Google.",
        };
      }
      if (
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request"
      ) {
        return { ok: false as const, message: "Sign-in was cancelled." };
      }
      const message =
        typeof e === "object" &&
        e &&
        "message" in e &&
        typeof (e as Error).message === "string"
          ? (e as Error).message
          : "Google sign-in failed.";
      return {
        ok: false as const,
        message,
      };
    }
  }, [auth]);

  const resetPassword = useCallback(
    async (email: string) => {
      if (!auth)
        return { ok: false as const, message: "Firebase not configured." };
      try {
        const { sendPasswordResetEmail } = await import("firebase/auth");
        await sendPasswordResetEmail(auth, email);
        return { ok: true as const };
      } catch (e) {
        return {
          ok: false as const,
          message:
            typeof e === "object" &&
            e &&
            "code" in e &&
            (e as { code?: string }).code === "auth/invalid-email"
              ? "Invalid email."
              : "Could not send reset email.",
        };
      }
    },
    [auth],
  );

  const guestLogin = useCallback(async () => {
    const guestEmail = process.env.NEXT_PUBLIC_GUEST_EMAIL ?? "guest@gmail.com";
    const guestPassword =
      process.env.NEXT_PUBLIC_GUEST_PASSWORD ?? "guest123";
    return login(guestEmail, guestPassword);
  }, [login]);

  const saveBookToLibrary = useCallback(
    async (book: Book) => {
      if (!user || !db) return;

      const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
      const next = uniqueBooks([...(profile?.savedBooks ?? []), book]);

      await setDoc(
        doc(db, "users", user.uid),
        { savedBooks: next, updatedAt: serverTimestamp() },
        { merge: true },
      );
    },
    [user, db, profile?.savedBooks],
  );

  const markBookFinished = useCallback(
    async (bookId: string) => {
      if (!user || !db) return;

      const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
      const next = Array.from(
        new Set([...(profile?.finishedBookIds ?? []), bookId]),
      );

      await setDoc(
        doc(db, "users", user.uid),
        { finishedBookIds: next, updatedAt: serverTimestamp() },
        { merge: true },
      );
    },
    [user, db, profile?.finishedBookIds],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseReady,
      user,
      profile,
      authLoading,
      logout,
      register,
      login,
      googleLogin,
      resetPassword,
      guestLogin,
      saveBookToLibrary,
      markBookFinished,
    }),
    [
      firebaseReady,
      user,
      profile,
      authLoading,
      logout,
      register,
      login,
      googleLogin,
      resetPassword,
      guestLogin,
      saveBookToLibrary,
      markBookFinished,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {client === null ? (
        <div className="banner" role="alert">
          <strong>Firebase web config is missing</strong> (no{" "}
          <code>NEXT_PUBLIC_FIREBASE_*</code> values in this build).{" "}
          <strong>Local:</strong> put them in <code>.env.local</code> and restart the dev server.{" "}
          <strong>Vercel / production:</strong> add the same variables under Project Settings →
          Environment Variables, then redeploy — <code>.env.local</code> is never sent to the host
          and is not used in production builds.
        </div>
      ) : null}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}
