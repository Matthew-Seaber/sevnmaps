import { headers } from "next/headers";

import Stripe from "stripe";
import { stripe } from "@/lib/stripe";

import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const body = await request.text();

  const fullHeaders = await headers();
  const signature = fullHeaders.get("stripe-signature");

  if (!signature) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error) {
    console.error("Error verifying Stripe webhook signature:", error);

    return new Response("Webhook error: invalid Stripe webhook signature", {
      status: 400,
    });
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      const subscription = event.data.object as Stripe.Subscription;

      await syncSubscription(subscription);

      break;

    case "invoice.payment_failed":
      const invoice = event.data.object as Stripe.Invoice;

      console.log(
        "Payment failed for invoice:",
        invoice.id,
        "for customer:",
        invoice.customer,
      );

      break;

    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;

      console.log("Checkout session completed for session:", session.id);

      break;

    default:
      console.log("Unhandled event type:", event.type);
  }

  return new Response("OK", { status: 200 });
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;

  if (!userId) {
    console.error("Subscription has no userId", subscription.id);

    return;
  }

  const subscriptionItem = subscription.items.data[0];

  if (!subscriptionItem) {
    console.error("Subscription has no items", subscription.id);

    return;
  }

  const priceId = subscription.items.data[0]?.price.id;

  let planType;

  if (subscription.status === "canceled") {
    planType = "free";
  } else {
    if (priceId === process.env.STRIPE_PRO_MONTHLY_PRICE_ID) {
      planType = "pro_monthly";
    } else if (priceId === process.env.STRIPE_PRO_ANNUAL_PRICE_ID) {
      planType = "pro_annual";
    } else if (priceId === process.env.STRIPE_EXPLORER_MONTHLY_PRICE_ID) {
      planType = "explorer_monthly";
    } else if (priceId === process.env.STRIPE_EXPLORER_ANNUAL_PRICE_ID) {
      planType = "explorer_annual";
    } else {
      throw new Error("Unknown priceId");
    }
  }

  await db
    .update(subscriptions)
    .set({
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      planType,
      status: subscription.status,
      currentPeriodStart: new Date(
        subscriptionItem.current_period_start * 1000,
      ),
      currentPeriodEnd: new Date(subscriptionItem.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    })
    .where(eq(subscriptions.userId, userId));
}
