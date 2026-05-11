import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getAdminAuth } from "@/lib/firebase/admin";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured. Set STRIPE_SECRET_KEY." },
      { status: 501 },
    );
  }

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    return NextResponse.json(
      { error: "FIREBASE_SERVICE_ACCOUNT_KEY is required for Checkout." },
      { status: 500 },
    );
  }

  const monthlyPriceId = process.env.STRIPE_PRICE_MONTHLY;
  const yearlyPriceId = process.env.STRIPE_PRICE_YEARLY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!monthlyPriceId || !yearlyPriceId || !siteUrl) {
    return NextResponse.json(
      {
        error:
          "Missing STRIPE_PRICE_MONTHLY, STRIPE_PRICE_YEARLY, or NEXT_PUBLIC_SITE_URL",
      },
      { status: 500 },
    );
  }

  try {
    const authHeader =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
    const decoded = await getAdminAuth().verifyIdToken(authHeader);

    const body = (await request.json()) as { billing?: string };
    const billingCycle = body.billing === "yearly" ? "annual" : "monthly";

    const price = billingCycle === "monthly" ? monthlyPriceId : yearlyPriceId;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      success_url: `${siteUrl}/settings?checkout=success`,
      cancel_url: `${siteUrl}/choose-plan`,
      line_items: [
        {
          price,
          quantity: 1,
        },
      ],
      metadata: {
        firebaseUid: decoded.uid,
        billing: billingCycle,
      },
      subscription_data:
        billingCycle === "annual"
          ? {
              trial_period_days: 7,
              metadata: {
                firebaseUid: decoded.uid,
                billing: billingCycle,
              },
            }
          : {
              metadata: {
                firebaseUid: decoded.uid,
                billing: billingCycle,
              },
            },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
