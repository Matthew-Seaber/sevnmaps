import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { place_user_link } from "@/db/schema";

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json(
      { error: "Signed in user not found" },
      { status: 401 },
    );
  }

  const { placeId, favorite } = await request.json();
  const userId = session.user.id;

  const result = await db
    .insert(place_user_link)
    .values({
      placeId,
      userId,
      favorite: favorite,
      favoritedAt: favorite ? new Date() : null,
    })
    .onConflictDoUpdate({
      target: [place_user_link.placeId, place_user_link.userId],
      set: {
        favorite: favorite,
        favoritedAt: favorite ? new Date() : null,
      },
    });

  if (!result) {
    return NextResponse.json(
      { error: "Failed to update favorite status" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { message: "Favorite status updated successfully" },
    { status: 200 },
  );
}
