"use client";

import dynamic from "next/dynamic";

import { AuthOverlayPortal } from "@/components/auth/AuthOverlayPortal";
import { useAppSelector } from "@/store/hooks";

const AuthModalLazy = dynamic(
  () => import("@/components/auth/AuthModal").then((m) => ({ default: m.AuthModal })),
  {
    ssr: false,
    loading: () => (
      <AuthOverlayPortal>
        <div
          className="authOverlay"
          role="status"
          aria-live="polite"
          aria-label="Loading sign-in"
        >
          <div className="authBackdrop" aria-hidden />
          <div className="authModalCard">
            <div className="authModalGateLoad">
              <div className="authModalLoadPulse" />
            </div>
          </div>
        </div>
      </AuthOverlayPortal>
    ),
  },
);

/** Loads the auth modal chunk only when the user opens it. */
export function AuthModalGate() {
  const open = useAppSelector((s) => s.ui.authModalOpen);
  if (!open) return null;
  return <AuthModalLazy />;
}
