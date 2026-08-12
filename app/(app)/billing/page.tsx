import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { stripe } from "@/lib/stripe";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

async function BillingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const response = await db
    .select({
      stripeCustomerId: subscriptions.stripeCustomerId,
    })
    .from(subscriptions)
    .where(eq(subscriptions.userId, session.user.id))
    .limit(1);

  const stripeCustomerId = response[0]?.stripeCustomerId;

  if (response.length === 0 || !stripeCustomerId) {
    return;
  }

  const billingSession = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
  });

  async function openBillingPortal() {
    "use server";

    redirect(billingSession.url);
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl sm:text-3xl font-semibold mt-8 mb-2">
        Billing Information
      </h1>
      <p className="mb-8">
        Click the button below to manage your billing information and payment
        methods on Stripe.
      </p>

      <form action={openBillingPortal}>
        <button
          type="submit"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-lg border border-transparent bg-clip-padding text-md font-medium outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 bg-primary text-primary-foreground hover:bg-primary/80 px-6 py-4 active:translate-y-px transition-[translate]"
        >
          Open Stripe Billing Portal
        </button>
      </form>

      <p className="text-sm text-muted-foreground mt-8">
        Not found what you&apos;re looking for? Feel free to{" "}
        <a href="/contact" className="underline">
          contact support
        </a>{" "}
        with any queries you may have.
      </p>
    </div>
  );
}

export default BillingPage;
