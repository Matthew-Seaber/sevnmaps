import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { visited_countries } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json(
      { error: "Signed in user not found" },
      { status: 401 },
    );
  }

  const { countryId } = await request.json();

  if (!countryId) {
    return NextResponse.json(
      { error: "Required parameter missing (countryId)" },
      { status: 400 },
    );
  }

  const result = await db
    .delete(visited_countries)
    .where(
      and(
        eq(visited_countries.userId, session.user.id),
        eq(visited_countries.countryId, countryId),
      ),
    );

  if (!result) {
    return NextResponse.json(
      { error: "Failed to remove visited status" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { message: "Visited status removed successfully" },
    { status: 200 },
  );
}
