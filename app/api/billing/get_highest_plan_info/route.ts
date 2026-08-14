import { NextResponse } from "next/server";

import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { inArray } from "drizzle-orm";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userIDs = url.searchParams.get("userIDs");

  if (!userIDs) {
    return NextResponse.json(
      { error: "Missing parameter: userIDs" },
      { status: 400 },
    );
  }

  const subscriptionsData = await db
    .select({
      userId: subscriptions.userId,
      planType: subscriptions.planType,
    })
    .from(subscriptions)
    .where(inArray(subscriptions.userId, userIDs.split(",")));

  if (!subscriptionsData || subscriptionsData.length === 0) {
    return NextResponse.json(
      { error: "No subscription data found for the provided userIDs" },
      { status: 404 },
    );
  }

  if (subscriptionsData.length === 1) {
    return NextResponse.json({ planType: subscriptionsData[0].planType });
  }

  if (
    subscriptionsData[0].planType.startsWith("explorer") ||
    subscriptionsData[1].planType.startsWith("explorer")
  ) {
    return NextResponse.json({ planType: "explorer" });
  } else if (
    subscriptionsData[0].planType.startsWith("pro") ||
    subscriptionsData[1].planType.startsWith("pro")
  ) {
    return NextResponse.json({ planType: "pro" });
  } else {
    return NextResponse.json({ planType: "free" });
  }
}
