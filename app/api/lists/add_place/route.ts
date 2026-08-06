import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { list_place_link, list_members } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";

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

  const { listID, placeID } = await request.json();

  if (!listID || !placeID) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const userID = session.user.id;

  try {
    await db.transaction(async (tx) => {
      const [userRole] = await tx
        .select()
        .from(list_members)
        .where(
          and(
            eq(list_members.listId, listID),
            eq(list_members.userId, userID),
            inArray(list_members.role, ["Creator", "Admin", "Editor"]),
          ),
        );

      if (!userRole) {
        throw new Error("User is not authorised to add a place to this list");
      }

      await tx.insert(list_place_link).values({
        listId: listID,
        placeId: placeID,
        addedBy: userID,
      });
    });
  } catch (error) {
    console.error("Error adding place to list:", error);

    return NextResponse.json(
      { error: "Failed to add place to list" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { message: "Place successfully added to list" },
    { status: 200 },
  );
}
