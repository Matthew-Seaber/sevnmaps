import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "User not authenticated" });
  }

  const userId = session.user.id;

  const planInfo = await db
    .select({
      planType: subscriptions.planType,
    })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (!planInfo || planInfo.length === 0) {
    return NextResponse.json(
      { error: "Error fetching plan info" },
      { status: 500 },
    );
  }

  return NextResponse.json({ planInfo });
}
