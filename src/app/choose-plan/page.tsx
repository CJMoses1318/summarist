"use client";

import Image from "next/image";
import { useState } from "react";

import { useAuthContext } from "@/components/providers/AuthProvider";
import { uiActions } from "@/store/uiSlice";
import { useAppDispatch } from "@/store/hooks";

type Billing = "monthly" | "yearly";

export default function ChoosePlanPage() {
  const dispatch = useAppDispatch();
  const { user, firebaseReady } = useAuthContext();
  const [billing, setBilling] = useState<Billing>("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [busy, setBusy] = useState(false);

  const priceLabel = billing === "monthly" ? "$9.99 / month" : "$79 / year";

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
        alert((body as { error?: string }).error ?? "Could not create checkout.");
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
      q: "What is included in Premium?",
      a: "Unlimited summaries, audio playback, personalized recommendations, and early access to new titles.",
    },
    {
      q: "Can I cancel any time?",
      a: "Yes. Stripe Customer Portal handles cancellation and receipts—connect it in Dashboard for production.",
    },
    {
      q: "Does the yearly plan include a trial?",
      a: "This project configures a 7-day trial when you subscribe to the annual billing option.",
    },
  ];

  return (
    <main className="choosePlanHero">
      <Image
        alt=""
        src="/pricing-top.png"
        width={860}
        height={722}
        style={{ width: "100%", height: "auto", borderRadius: 14 }}
        priority
      />

      <div style={{ marginTop: 18 }} className="sectionTitle">
        Choose your plan
      </div>

      <div className="planToggle">
        <button
          type="button"
          className={`planChip ${billing === "monthly" ? "isOn" : "isOff"}`}
          onClick={() => setBilling("monthly")}
        >
          Monthly
        </button>
        <button
          type="button"
          className={`planChip ${billing === "yearly" ? "isOn" : "isOff"}`}
          onClick={() => setBilling("yearly")}
        >
          Yearly (7-day trial)
        </button>
      </div>

      <section
        style={{
          background: "rgba(219,231,236,0.55)",
          borderRadius: 16,
          padding: 18,
        }}
      >
        <div style={{ fontWeight: 900 }}>Summarist {billing === "yearly" ? "Plus" : "Premium"}</div>
        <div style={{ fontSize: 28, marginTop: 8 }}>{priceLabel}</div>
        <p style={{ opacity: 0.8 }}>
          Stripe Checkout opens in a hosted page. Use test cards locally (see Stripe docs).
        </p>

        <button type="button" className="btnPrimary" disabled={busy} onClick={subscribe}>
          {busy ? "Opening checkout..." : `Continue with Stripe (${billing})`}
        </button>
      </section>

      <section style={{ marginTop: 28 }}>
        <div className="sectionTitle" style={{ marginBottom: 12 }}>
          FAQ
        </div>
        <div style={{ borderRadius: 12, overflow: "hidden" }}>
          {faqs.map((item, idx) => (
            <div key={item.q}>
              <button
                type="button"
                className="faqBtn"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                {item.q}
              </button>
              {openFaq === idx ? <div className="faqAnswer">{item.a}</div> : null}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
