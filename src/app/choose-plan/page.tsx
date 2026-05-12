"use client";

import Image from "next/image";
import { useId, useState } from "react";

import { useAuthContext } from "@/components/providers/AuthProvider";
import { uiActions } from "@/store/uiSlice";
import { useAppDispatch } from "@/store/hooks";

import "./choose-plan.css";

type Billing = "monthly" | "yearly";

function IconDoc() {
  return (
    <svg className="plan__featureIcon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 3h7l5 5v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconPlant() {
  return (
    <svg className="plan__featureIcon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 22V12M12 12c-3-4-2.5-8 0-10 2.5 2 3 6 0 10zM12 12c3-4 2.5-8 0-10-2.5 2-3 6 0 10z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 22h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconHandshake() {
  return (
    <svg className="plan__featureIcon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 11 2 9l2-2 3 3M20 11l2-2-2-2-3 3M8 14l2 2 2-2M14 14l2 2 2-2M10 16l1 2h2l1-2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ChoosePlanPage() {
  const dispatch = useAppDispatch();
  const { user, firebaseReady } = useAuthContext();
  const [billing, setBilling] = useState<Billing>("yearly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [busy, setBusy] = useState(false);
  const faqPrefix = useId();

  async function subscribe() {
    if (!firebaseReady) return;
    if (!user) {
      dispatch(uiActions.openAuthModal("login"));
      return;
    }

    setBusy(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          billing,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Bad response" }));
        const b = body as { error?: string; debug?: string; stripeCode?: string };
        const parts = [
          b.error ?? "Could not create checkout.",
          b.debug,
          b.stripeCode ? `Stripe: ${b.stripeCode}` : "",
        ].filter(Boolean);
        alert(parts.join("\n\n"));
        return;
      }

      const payload = (await res.json()) as { url?: string };
      if (payload.url) {
        window.location.href = payload.url;
      }
    } finally {
      setBusy(false);
    }
  }

  const faqs = [
    {
      q: "How does the free 7-day trial work?",
      a: "Begin your complimentary 7-day trial with a Summarist annual membership. You are under no obligation to continue your subscription, and you will only be billed when the trial period expires. With Premium access, you can learn at your own pace and as frequently as you desire, and you may terminate your subscription prior to the conclusion of the 7-day free trial.",
    },
    {
      q: "Can I switch subscriptions from monthly to yearly, or yearly to monthly?",
      a: "While an annual plan is active, it is not feasible to switch to a monthly plan. However, once the current month ends, transitioning from a monthly plan to an annual plan is an option.",
    },
    {
      q: "What's included in the Premium plan?",
      a: "Premium membership provides you with the ultimate Summarist experience, including unrestricted entry to many best-selling books, high-quality audio, the ability to download titles for offline reading, and the option to send your reads to your Kindle.",
    },
    {
      q: "Can I cancel during my trial or subscription?",
      a: "You will not be charged if you cancel your trial before its conclusion. While you will not have complete access to the entire Summarist library, you can still expand your knowledge with one curated book per day."
    },
  ];

  const ctaLabel =
    billing === "yearly"
      ? busy
        ? "Opening checkout..."
        : "Start your free 7-day trial"
      : busy
        ? "Opening checkout..."
        : "Continue with Premium Monthly";

  const ctaDisclaimer =
    billing === "yearly"
      ? "Cancel your trial at any time before it ends, and you won't be charged"
      : "Billed monthly at checkout. Cancel any time from your account settings.";

  return (
    <main className="plan">
      <div className="wrapper wrapper__full">
        <header className="plan__header--wrapper">
          <h1 className="plan__headerTitle">Get unlimited access to many amazing books to read</h1>
          <p className="plan__headerSubtitle">
            Turn ordinary moments into amazing learning opportunities
          </p>
          <div className="plan__headerArch">
            <Image
              alt=""
              src="/pricing-top.png"
              width={420}
              height={352}
              sizes="(max-width: 768px) 100vw, 420px"
              priority
            />
          </div>
        </header>

        <section className="plan__features" aria-label="Why Summarist">
          <div className="plan__feature">
            <IconDoc />
            <p className="plan__featureText">Key ideas in few min with many books to read</p>
          </div>
          <div className="plan__feature">
            <IconPlant />
            <p className="plan__featureText">3 million people growing with Summarist everyday</p>
          </div>
          <div className="plan__feature">
            <IconHandshake />
            <p className="plan__featureText">Precise recommendations collections curated by experts</p>
          </div>
        </section>

        <div className="plan__intro">
          <h2 className="plan__introTitle">Choose the plan that fits you</h2>
        </div>

        <div className="plan__checkoutPanel">
          <div id="plan-cards" className="plan__cards" role="radiogroup" aria-label="Choose billing plan">
            <label className="plan__cardLabel" htmlFor="plan-billing-yearly">
              <span className={`plan__card ${billing === "yearly" ? "isSelected" : ""}`}>
                <input
                  id="plan-billing-yearly"
                  className="plan__cardRadio"
                  type="radio"
                  name="plan-billing"
                  value="yearly"
                  checked={billing === "yearly"}
                  onChange={() => setBilling("yearly")}
                />
                <span className="plan__cardRadioDot" aria-hidden />
                <span className="plan__cardBody">
                  <span className="plan__cardTitle">Premium Plus Yearly</span>
                  <div className="plan__cardPrice">$99.99/year</div>
                  <div className="plan__cardHint">7-day free trial included</div>
                </span>
              </span>
            </label>

            <div className="plan__or" aria-hidden>
              <span>or</span>
            </div>

            <label className="plan__cardLabel" htmlFor="plan-billing-monthly">
              <span className={`plan__card ${billing === "monthly" ? "isSelected" : ""}`}>
                <input
                  id="plan-billing-monthly"
                  className="plan__cardRadio"
                  type="radio"
                  name="plan-billing"
                  value="monthly"
                  checked={billing === "monthly"}
                  onChange={() => setBilling("monthly")}
                />
                <span className="plan__cardRadioDot" aria-hidden />
                <span className="plan__cardBody">
                  <span className="plan__cardTitle">Premium Monthly</span>
                  <div className="plan__cardPrice">$9.99/month</div>
                  <div className="plan__cardHint">No trial included</div>
                </span>
              </span>
            </label>
          </div>

          <div className="plan__card--cta">
            <button type="button" className="plan__ctaButton" disabled={busy} onClick={subscribe}>
              {ctaLabel}
            </button>
            <p className="plan__ctaDisclaimer">{ctaDisclaimer}</p>
          </div>

          <div className="faq__wrapper">
            {faqs.map((item, idx) => {
              const panelId = `${faqPrefix}-panel-${idx}`;
              const isOpen = openFaq === idx;
              return (
                <div key={item.q} className={`faq__item${isOpen ? " isOpen" : ""}`}>
                  <button
                    type="button"
                    className="faq__trigger"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    id={`${faqPrefix}-header-${idx}`}
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                  >
                    <span>{item.q}</span>
                    <span className="faq__chevron" aria-hidden />
                  </button>
                  <div
                    className="faq__panel"
                    id={panelId}
                    role="region"
                    aria-labelledby={`${faqPrefix}-header-${idx}`}
                    hidden={!isOpen}
                  >
                    {item.a}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
