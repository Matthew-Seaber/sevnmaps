import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { inArray } from "drizzle-orm";

export async function PATCH(request: Request) {
  const { notificationIDs } = await request.json();

  if (
    !notificationIDs ||
    !Array.isArray(notificationIDs) ||
    notificationIDs.length === 0
  ) {
    return NextResponse.json(
      { error: "No notification IDs provided" },
      { status: 400 },
    );
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

  await db
    .update(notifications)
    .set({ read: true })
    .where(inArray(notifications.id, notificationIDs));

  return NextResponse.json(
    { message: "All supplied notifications marked as read" },
    { status: 200 },
  );
}
