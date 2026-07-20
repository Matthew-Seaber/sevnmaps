import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { place_user_link, places, place_images, countries } from "@/db/schema";
import { sql, eq, and, desc } from "drizzle-orm";

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

  const visitedPlaces = await db
    .select({
      id: places.id,
      name: places.placeName,
      imageURL: place_images.imageURL,
      address: sql<string>`${places.city} || ', ' || ${countries.countryName}`,
      visited: place_user_link.visited,
      visitedAt: place_user_link.visitedAt,
    })
    .from(place_user_link)
    .innerJoin(places, eq(place_user_link.placeId, places.id))
    .leftJoin(place_images, eq(place_images.placeId, places.id))
    .innerJoin(countries, eq(countries.id, places.countryId))
    .where(
      and(
        eq(place_user_link.userId, session.user.id),
        eq(place_user_link.visited, true),
      ),
    )
    .orderBy(desc(place_user_link.visitedAt));

  return NextResponse.json({ visitedPlaces });
}
