"use client";

import { Provider } from "react-redux";

import type { ReactNode } from "react";
import { useRef } from "react";

import { AuthModalGate } from "@/components/auth/AuthModalGate";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { type AppStore, makeStore } from "@/store/store";

export default function AppProviders({ children }: { children: ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current}>
      <AuthProvider>
        <AuthModalGate />
        {children}
      </AuthProvider>
    </Provider>
  );
}
