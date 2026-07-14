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

  const { photoID } = await request.json();

  if (!photoID) {
    return NextResponse.json({ error: "Missing parameter" }, { status: 400 });
  }

  const imageDetails = await db.query.place_images.findFirst({
    where: eq(place_images.id, photoID),
  });

  const userProfile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, session.user.id),
  });

  const isAdmin = userProfile?.role === "admin";
  const isImageOwner = imageDetails?.uploadedBy === session.user.id;

  if (!isAdmin && !isImageOwner) {
    return NextResponse.json(
      { error: "Unauthorised to make this request" },
      { status: 403 },
    );
  }

  try {
    await db.delete(place_images).where(eq(place_images.id, photoID));
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to remove photo, ${error}` },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { message: "Photo successfully removed" },
    { status: 200 },
  );
}
