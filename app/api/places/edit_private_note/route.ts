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

  const { placeId, privateNote } = await request.json();

  if (!placeId) {
    return NextResponse.json(
      { error: "Place ID is required" },
      { status: 400 },
    );
  }

  const userId = session.user.id;

  try {
    const result = await db
      .insert(place_user_link)
      .values({
        placeId,
        userId,
        privateNote: privateNote,
      })
      .onConflictDoUpdate({
        target: [place_user_link.placeId, place_user_link.userId],
        set: {
          privateNote: privateNote,
        },
      });

    if (!result) {
      return NextResponse.json(
        { error: "Failed to update private note" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error editing private note:", error);

    return NextResponse.json(
      { error: "Failed to edit private note" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { message: "Private note updated successfully" },
    { status: 200 },
  );
}
