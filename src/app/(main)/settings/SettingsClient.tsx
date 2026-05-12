"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useAuthContext } from "@/components/providers/AuthProvider";
import { SkeletonBlock } from "@/components/ui/Skeleton";

function planDisplayName(plan: string | undefined) {
  if (plan === "premium") return "Premium";
  if (plan === "premium-plus") return "Premium+";
  return "Basic";
}

export function SettingsClient() {
  const searchParams = useSearchParams();
  const checkout = searchParams.get("checkout");
  const { user, profile, authLoading, firebaseReady } = useAuthContext();

  if (!firebaseReady || authLoading) {
    return (
      <main className="settingsPage pagePad">
        <SkeletonBlock height={44} />
        <SkeletonBlock height={12} />
        <SkeletonBlock height={96} />
        <SkeletonBlock height={72} />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="settingsPage pagePad settingsPage--guest">
        <Image src="/login.png" alt="" width={240} height={165} />
        <div className="settingsPage__guestTitle">Log in to see your subscription</div>
      </main>
    );
  }

  const planKey =
    profile?.subscriptionPlan === "premium"
      ? "premium"
      : profile?.subscriptionPlan === "premium-plus"
        ? "premium-plus"
        : "basic";

  const planName = planDisplayName(profile?.subscriptionPlan);

  return (
    <main className="settingsPage pagePad">
      {checkout === "success" ? (
        <div className="authError settingsPage__checkoutNote">
          Thanks! Stripe can take up to a minute to sync subscription status via webhook.
          Refresh shortly if needed.
        </div>
      ) : null}

      <h1 className="settingsPage__heading">Settings</h1>
      <div className="settingsPage__titleRule" aria-hidden />

      <section className="settingsPage__section" aria-labelledby="settings-subscription-heading">
        <h2 id="settings-subscription-heading" className="settingsPage__sectionTitle">
          Your Subscription plan
        </h2>
        <p className="settingsPage__planValue">{planName}</p>
        {planKey === "basic" ? (
          <Link href="/choose-plan" className="settingsPage__upgradeLink">
            <span className="settingsPage__upgradeBtn">Upgrade to Premium</span>
          </Link>
        ) : null}
      </section>

      <div className="settingsPage__divider" aria-hidden />

      <section className="settingsPage__section" aria-labelledby="settings-email-heading">
        <h2 id="settings-email-heading" className="settingsPage__sectionTitle">
          Email
        </h2>
        <p className="settingsPage__emailValue">{user.email}</p>
      </section>
    </main>
  );
}
