"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useAuthContext } from "@/components/providers/AuthProvider";
import { SkeletonBlock } from "@/components/ui/Skeleton";

export function SettingsClient() {
  const searchParams = useSearchParams();
  const checkout = searchParams.get("checkout");
  const { user, profile, authLoading, firebaseReady } = useAuthContext();

  if (!firebaseReady || authLoading) {
    return (
      <main className="pagePad">
        <SkeletonBlock height={120} />
        <SkeletonBlock height={210} />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="pagePad" style={{ textAlign: "center" }}>
        <Image src="/login.png" alt="" width={240} height={165} />
        <div style={{ marginTop: 12 }} className="sectionTitle">
          Log in to see your subscription
        </div>
      </main>
    );
  }

  const planLabel =
    profile?.subscriptionPlan === "premium"
      ? "premium"
      : profile?.subscriptionPlan === "premium-plus"
        ? "premium-plus"
        : "basic";

  return (
    <main className="pagePad">
      {checkout === "success" ? (
        <div className="authError" style={{ marginBottom: 16 }}>
          Thanks! Stripe can take up to a minute to sync subscription status via webhook.
          Refresh shortly if needed.
        </div>
      ) : null}

      <div style={{ marginBottom: 12 }} className="sectionTitle">
        Settings
      </div>

      <div style={{ marginBottom: 10, fontWeight: 700 }}>Subscription</div>

      <div style={{ marginBottom: 18 }}>Plan: {planLabel}</div>

      {planLabel === "basic" ? (
        <Link href="/choose-plan">
          <button type="button" className="btnPrimary">
            Upgrade plan
          </button>
        </Link>
      ) : null}

      <div style={{ marginTop: 28, marginBottom: 10, fontWeight: 700 }}>
        Email
      </div>
      <div>{user.email}</div>
    </main>
  );
}
