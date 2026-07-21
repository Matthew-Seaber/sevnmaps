import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { visited_countries } from "@/db/schema";

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

  const { countryId, visitedAt } = await request.json();

  const result = await db
    .insert(visited_countries)
    .values({
      userId: session.user.id,
      countryId,
      visitedAt: visitedAt ? new Date(visitedAt) : null,
    })
    .onConflictDoUpdate({
      target: [visited_countries.userId, visited_countries.countryId],
      set: {
        visitedAt: visitedAt ? new Date(visitedAt) : null,
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
