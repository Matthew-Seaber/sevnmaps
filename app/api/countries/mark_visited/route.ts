import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { visited_countries, countries } from "@/db/schema";
import { eq } from "drizzle-orm";

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

  const { countryId } = await request.json();

  if (!countryId) {
    return NextResponse.json(
      { error: "Required parameter missing (countryId)" },
      { status: 400 },
    );
  }

  try {
    await db.transaction(async (tx) => {
      const [countryInfo] = await tx
        .select({
          id: countries.id,
        })
        .from(countries)
        .where(eq(countries.countryCode, countryId));

      if (!countryInfo) {
        throw new Error(`Country with code ${countryId} not found`);
      }

      const result = await tx.insert(visited_countries).values({
        userId: session.user.id,
        countryId: countryInfo.id,
      });

      if (!result) {
        throw new Error("Failed to mark country as visited");
      }
    });
  } catch (error) {
    console.error("Error marking country as visited:", error);

    return NextResponse.json(
      { error: "Failed to mark as visited" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { message: "Visited status added successfully" },
    { status: 200 },
  );
}
