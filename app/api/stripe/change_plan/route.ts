import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

const prices = {
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
  pro_annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID!,
  explorer_monthly: process.env.STRIPE_EXPLORER_MONTHLY_PRICE_ID!,
  explorer_annual: process.env.STRIPE_EXPLORER_ANNUAL_PRICE_ID!,
};

export async function POST(request: Request) {
  const { planType } = await request.json();

  const relevantPriceId = prices[planType as keyof typeof prices];

  if (!relevantPriceId) {
    return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json(
      { error: "Signed in user not found" },
      { status: 401 },
    );
  }

  try {
    const currentSubscriptionData = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, session.user.id),
    });

    if (!currentSubscriptionData) {
      return NextResponse.json(
        { error: "No subscription row found for user" },
        { status: 404 },
      );
    }

    if (
      !currentSubscriptionData.stripeSubscriptionId ||
      !currentSubscriptionData.stripeCustomerId ||
      currentSubscriptionData.status === "canceled" ||
      currentSubscriptionData.status === "inactive" ||
      currentSubscriptionData.planType === "free"
    ) {
      // No ongoing subscription

      const stripeSession = await stripe.checkout.sessions.create({
        mode: "subscription",

        line_items: [
          {
            price: relevantPriceId,
            quantity: 1,
          },
        ],

        ...(currentSubscriptionData?.stripeCustomerId
          ? {
              customer: currentSubscriptionData.stripeCustomerId,
            }
          : {
              customer_email: session.user.email,
            }),

        client_reference_id: session.user.id,

        metadata: {
          userId: session.user.id,
        },

        subscription_data: {
          trial_period_days: 7,

          metadata: {
            userId: session.user.id,
          },
        },

        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      });

      return NextResponse.json({ type: "checkout", url: stripeSession.url });
    } else {
      // Ongoing subscription

      const stripeSubscription = await stripe.subscriptions.retrieve(
        currentSubscriptionData.stripeSubscriptionId,
      );

      const subscriptionItem = stripeSubscription.items.data[0];

      if (!subscriptionItem) {
        return NextResponse.json(
          { error: "Subscription has no items" },
          { status: 500 },
        );
      }

      if (subscriptionItem.price.id === relevantPriceId) {
        return NextResponse.json({ type: "existing" });
      }

      if (stripeSubscription.cancel_at_period_end) {
        await stripe.subscriptions.update(stripeSubscription.id, {
          cancel_at_period_end: false,
        });
      }

      await stripe.subscriptions.update(stripeSubscription.id, {
        items: [
          {
            id: subscriptionItem.id,
            price: relevantPriceId,
          },
        ],

        proration_behavior: "always_invoice",

        payment_behavior: "pending_if_incomplete",
      });

      return NextResponse.json({ type: "updated" });
    }
  } catch (error) {
    console.error("Error changing subscription plan:", error);

    return NextResponse.json(
      { error: "Error changing subscription plan" },
      { status: 500 },
    );
  }
}
