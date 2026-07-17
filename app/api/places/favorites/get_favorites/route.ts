import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { place_user_link } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json(
      { error: "Signed in user not found" },
      { status: 401 },
    );
  }

  const favoritePlaces = await db
    .select()
    .from(place_user_link)
    .where(
      and(
        eq(place_user_link.userId, session.user.id),
        eq(place_user_link.favorite, true),
      ),
    )
    .orderBy(desc(place_user_link.favoritedAt));

  return NextResponse.json({ favoritePlaces });
}
