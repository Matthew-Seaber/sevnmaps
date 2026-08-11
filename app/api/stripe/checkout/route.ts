import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";

import { auth } from "@/lib/auth";

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
    const stripeSession = await stripe.checkout.sessions.create({
      mode: "subscription",

      line_items: [
        {
          price: relevantPriceId,
          quantity: 1,
        },
      ],

      customer_email: session.user.email,

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

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("Error returning Stripe checkout session:", error);

    return NextResponse.json(
      { error: "Error returning Stripe checkout session" },
      { status: 500 },
    );
  }
}
