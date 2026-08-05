import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { reviews } from "@/db/schema";

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

  const { placeId, stars, comment } = await request.json();

  if (!placeId || !stars) {
    return NextResponse.json(
      { error: "Missing parameters: placeId or stars" },
      { status: 400 },
    );
  }

  const userId = session.user.id;

  try {
    const result = await db.insert(reviews).values({
      placeId,
      userId,
      stars,
      comment,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Failed to create review" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error creating review:", error);

    return NextResponse.json(
      { error: "An error occurred while posting the review" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { message: "Review successfully posted" },
    { status: 201 },
  );
}
