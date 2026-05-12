"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";

import { useAuthContext } from "@/components/providers/AuthProvider";
import { SettingsPageSkeleton } from "@/components/ui/PageSkeletons";

/** Production sales page (stable URL across preview deployments). */
const CHOOSE_PLAN_URL = "https://summarist.vercel.app/choose-plan";

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
    return <SettingsPageSkeleton />;
  }

  if (!user) {
    return (
      <main className="settingsPage pagePad settingsPage--guest">
        {checkout === "success" ? (
          <div className="authError settingsPage__checkoutNote">
            Thanks for subscribing. Your plan appears here after you sign in with the same
            account you used at checkout. If the banner still shows after login, wait a few
            seconds for the server to finish updating your plan, then refresh.
          </div>
        ) : null}
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
          Checkout completed. Your plan updates when our server receives Stripe&apos;s webhook
          (usually within seconds). This page refreshes automatically from your profile; if the
          plan still shows Basic, confirm the Stripe webhook is configured for this deployment
          and try a manual refresh.
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
          <a
            href={CHOOSE_PLAN_URL}
            className="settingsPage__upgradeLink"
            rel="noopener noreferrer"
          >
            <span className="settingsPage__upgradeBtn">Upgrade to Premium</span>
          </a>
        ) : null}
      </section>

      <div className="settingsPage__divider" aria-hidden />

      <section className="settingsPage__section" aria-labelledby="settings-email-heading">
        <h2 id="settings-email-heading" className="settingsPage__sectionTitle">
          Email
        </h2>
        <p className="settingsPage__emailValue">
          {user.email ?? user.providerData[0]?.email ?? "Not available for this sign-in method"}
        </p>
      </section>
    </main>
  );
}
