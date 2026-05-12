"use client";

import dynamic from "next/dynamic";
import { useAppSelector } from "@/store/hooks";

const AuthModalLazy = dynamic(
  () => import("@/components/auth/AuthModal").then((m) => ({ default: m.AuthModal })),
  { ssr: false },
);

/** Loads the auth modal chunk only when the user opens it. */
export function AuthModalGate() {
  const open = useAppSelector((s) => s.ui.authModalOpen);
  if (!open) return null;
  return <AuthModalLazy />;
}
