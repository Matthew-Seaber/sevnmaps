import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  visited_countries,
  countries,
  place_user_link,
  places,
} from "@/db/schema";
import { and, eq, count } from "drizzle-orm";

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
      placesVisited: count(places.id),
      visitedAt: visited_countries.visitedAt,
    })
    .from(visited_countries)
    .innerJoin(countries, eq(visited_countries.countryId, countries.id))
    .leftJoin(place_user_link, eq(place_user_link.userId, session.user.id))
    .leftJoin(
      places,
      and(
        eq(place_user_link.placeId, places.id),
        eq(places.countryId, countries.id),
        eq(place_user_link.visited, true),
      ),
    )
    .where(eq(visited_countries.userId, session.user.id))
    .groupBy(
      countries.countryCode,
      countries.countryName,
      countries.continent,
      countries.flag,
      visited_countries.visitedAt,
    );

  return NextResponse.json({ visitedCountries });
}
