"use client";

import { createPortal } from "react-dom";
import type { ReactNode } from "react";

/** Renders above the app shell (sticky headers, sidebars, etc.). */
export function AuthOverlayPortal({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}
