import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getAdminAuth } from "@/lib/firebase/admin";

/** Expose `debug` / `stripeCode` on error JSON (set CHECKOUT_VERBOSE_ERRORS=1 for `next start`). */
const exposeCheckoutDetails =
  process.env.NODE_ENV === "development" ||
  process.env.CHECKOUT_VERBOSE_ERRORS === "1";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

function errMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function isFirebaseAuthCode(code: unknown): boolean {
  return typeof code === "string" && code.startsWith("auth/");
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

  const authHeader =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";

  if (!authHeader) {
    return NextResponse.json(
      { error: "Missing authorization token." },
      { status: 401 },
    );
  }

  let decoded: { uid: string };
  try {
    decoded = await getAdminAuth().verifyIdToken(authHeader);
  } catch (err) {
    console.error("[api/checkout] verifyIdToken failed:", err);
    const code =
      typeof err === "object" && err !== null && "code" in err
        ? (err as { code?: unknown }).code
        : undefined;
    const friendly =
      isFirebaseAuthCode(code) || code === "app/invalid-credential"
        ? "Invalid or expired session. Sign in again."
        : "Could not verify sign-in.";
    return NextResponse.json(
      {
        error: friendly,
        ...(exposeCheckoutDetails && { debug: errMessage(err) }),
      },
      { status: 401 },
    );
  }

  let body: { billing?: string };
  try {
    body = (await request.json()) as { billing?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const billingCycle = body.billing === "yearly" ? "annual" : "monthly";
  const price = billingCycle === "monthly" ? monthlyPriceId : yearlyPriceId;

  let session: Stripe.Response<Stripe.Checkout.Session>;
  try {
    session = await stripe.checkout.sessions.create({
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
  } catch (err) {
    console.error("[api/checkout] Stripe checkout.sessions.create failed:", err);
    if (err instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          error: "Could not create checkout session.",
          ...(exposeCheckoutDetails && {
            debug: err.message,
            stripeCode: err.code,
          }),
        },
        { status: 502 },
      );
    }
    return NextResponse.json(
      {
        error: "Checkout failed.",
        ...(exposeCheckoutDetails && { debug: errMessage(err) }),
      },
      { status: 500 },
    );
  }

  if (!session.url) {
    return NextResponse.json(
      { error: "Stripe did not return a checkout URL" },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: session.url });
}
