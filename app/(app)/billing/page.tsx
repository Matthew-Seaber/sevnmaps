import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { stripe } from "@/lib/stripe";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

import { Button } from "@/components/ui/button";

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
    return (
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-2xl sm:text-3xl font-semibold mt-8">
          No past transactions found.
        </h1>

        <form action="/pricing">
          <Button type="submit" className="mt-6 p-5">
            Upgrade your account
          </Button>
        </form>

        <p className="text-sm text-muted-foreground mt-6">
          Believe this is an error? Please{" "}
          <a href="/contact" className="underline">
            contact support
          </a>{" "}
          with any queries you may have.
        </p>
      </div>
    );
  }

  const billingSession = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
  });

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl sm:text-3xl font-semibold mt-8 mb-2">
        Billing Information
      </h1>

      <p className="mb-8">
        Click the button below to manage your billing information and payment
        methods on Stripe.
      </p>

      <form action={billingSession.url}>
        <Button type="submit" className="px-8 py-6 text-md">
          Open Stripe Billing Portal
        </Button>
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
