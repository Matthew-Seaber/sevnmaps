import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { visited_countries, countries, places } from "@/db/schema";
import { eq, count } from "drizzle-orm";

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

  const visitedCountries = await db
    .select({
      countryCode: countries.countryCode,
      name: countries.countryName,
      continent: countries.continent,
      flag: countries.flag,
      placesVisited: count(places.countryId),
      visitedAt: visited_countries.visitedAt,
    })
    .from(visited_countries)
    .innerJoin(countries, eq(visited_countries.countryId, countries.id))
    .leftJoin(places, eq(countries.id, places.countryId))
    .where(eq(visited_countries.userId, session.user.id))
    .groupBy(countries.countryCode, countries.countryName, countries.continent, countries.flag, visited_countries.visitedAt);

  return NextResponse.json({ visitedCountries });
}
