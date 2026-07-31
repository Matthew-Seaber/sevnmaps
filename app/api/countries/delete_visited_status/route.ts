import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { visited_countries, countries } from "@/db/schema";
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

  const { countryId, type } = await request.json();

  if (!countryId || !type || (type !== "code" && type !== "id")) {
    return NextResponse.json(
      { error: "Required parameter missing or invalid (countryId or type)" },
      { status: 400 },
    );
  }

  let countryID: string;

  if (type === "code") {
    const [countryInfo] = await db
      .select({
        id: countries.id,
      })
      .from(countries)
      .where(eq(countries.countryCode, countryId));

    if (!countryInfo) {
      return NextResponse.json(
        { error: `Country with code ${countryId} not found` },
        { status: 404 },
      );
    }

    countryID = countryInfo.id;
  } else {
    countryID = countryId;
  }

  const result = await db
    .delete(visited_countries)
    .where(
      and(
        eq(visited_countries.userId, session.user.id),
        eq(visited_countries.countryId, countryID),
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
