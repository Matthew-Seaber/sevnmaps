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

  const { placeId, visited, visitedAt } = await request.json();

  const userId = session.user.id;
  const visitedDate = visitedAt ? new Date(visitedAt) : null;

  const result = await db
    .insert(place_user_link)
    .values({
      placeId,
      userId,
      visited: visited,
      visitedAt: visitedDate || null,
    })
    .onConflictDoUpdate({
      target: [place_user_link.placeId, place_user_link.userId],
      set: {
        visited: visited,
        visitedAt: visitedDate || null,
      },
    });

  if (!result) {
    return NextResponse.json(
      { error: "Failed to update visited status" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { message: "Visited status updated successfully" },
    { status: 200 },
  );
}
