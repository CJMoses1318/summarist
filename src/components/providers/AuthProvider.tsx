"use client";

import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getFirebaseAuth,
  getFirebaseFirestore,
} from "@/lib/firebase/client";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const auth = mounted ? getFirebaseAuth() : null;
  const db = mounted ? getFirebaseFirestore() : null;
  const firebaseReady = mounted && Boolean(auth && db);

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (!mounted) return;
    if (!auth || !db) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(true);
      if (!firebaseUser) {
        setProfile(null);
        setAuthLoading(false);
        return;
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

    return () => unsubscribe();
  }, [mounted, auth, db]);

  useEffect(() => {
    if (!user || !db) return;

    const ref = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(
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

    return () => unsubscribe();
  }, [mounted, user, db]);

  const logout = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
  }, [auth]);

  const register = useCallback(
    async (email: string, password: string) => {
      if (!auth)
        return { ok: false as const, message: "Firebase not configured." };
      try {
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
      await signInWithPopup(auth, new GoogleAuthProvider());
      return { ok: true as const };
    } catch (e) {
      const message =
        typeof e === "object" &&
        e &&
        "message" in e &&
        typeof (e as Error).message === "string"
          ? (e as Error).message
          : "Google sign-in cancelled.";
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

      const next = Array.from(new Set([...(profile?.finishedBookIds ?? []), bookId]));

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
      {!firebaseReady && mounted ? (
        <div className="banner">
          Firebase is not configured. Create `.env.local` from `env.example`, set
          `NEXT_PUBLIC_FIREBASE_*` (no quotes or spaces after `=`), and restart the
          dev server. Use `.env.local` — Next.js does not load `env.local`.
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
