import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { profiles, place_images } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json(
      { error: "Signed in user not found" },
      { status: 401 },
    );
  }

  const userProfile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, session.user.id),
  });

  if (!userProfile || userProfile.role !== "admin") {
    return NextResponse.json({
      error: "Unauthorised to make this request",
      status: 403,
    });
  }

  const { photoID, makePrimary } = await request.json();

  if (!photoID) {
    return NextResponse.json({ error: "Missing parameter" }, { status: 400 });
  }

  try {
    await db
      .update(place_images)
      .set({
        primaryImage: makePrimary ? true : false,
        underReview: false,
      })
      .where(eq(place_images.id, photoID));
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to approve photo, ${error}` },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { message: "Photo successfully approved" },
    { status: 200 },
  );
}
