import { NextResponse } from "next/server";
import Stripe from "stripe";

import { FieldValue, type Firestore } from "firebase-admin/firestore";

import { getAdminDb } from "@/lib/firebase/admin";

export const runtime = "nodejs";

function getStripe() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return null;
  return new Stripe(secret);
}

function planFromBillingLabel(billing: string | undefined) {
  if (billing === "annual") return "premium-plus";
  return "premium";
}

async function upsertPlanForUid(
  db: Firestore,
  uid: string,
  plan: "basic" | "premium" | "premium-plus",
  stripeCustomerId?: string,
) {
  const payload: Record<string, unknown> = {
    subscriptionPlan: plan,
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (stripeCustomerId) payload.stripeCustomerId = stripeCustomerId;
  await db.collection("users").doc(uid).set(payload, { merge: true });
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 501 });
  }

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    return NextResponse.json(
      { error: "FIREBASE_SERVICE_ACCOUNT_KEY is required for webhook." },
      { status: 500 },
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const db = getAdminDb();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.metadata?.firebaseUid;
        if (!uid) break;

        const billing = session.metadata?.billing ?? "monthly";
        const plan = planFromBillingLabel(billing);

        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;

        await upsertPlanForUid(db, uid, plan, customerId ?? "");
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const uid = subscription.metadata?.firebaseUid;
        if (!uid) break;
        if (subscription.status !== "active" && subscription.status !== "trialing") {
          break;
        }
        const billing = subscription.metadata?.billing ?? "monthly";
        const plan = planFromBillingLabel(billing);
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;
        await upsertPlanForUid(db, uid, plan, customerId ?? "");
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const snapshot = await db
          .collection("users")
          .where("stripeCustomerId", "==", customerId)
          .limit(1)
          .get();

        if (!snapshot.empty) {
          const doc = snapshot.docs[0]!;
          await doc.ref.set(
            {
              subscriptionPlan: "basic",
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true },
          );
        }
        break;
      }
      default:
        break;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Firestore update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
