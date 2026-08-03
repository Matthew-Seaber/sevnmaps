import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { list_place_link, list_members } from "@/db/schema";
import { and, inArray, eq } from "drizzle-orm";

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
        throw new Error(
          "User is not authorised to remove a place from this list",
        );
      }

      await tx
        .delete(list_place_link)
        .where(
          and(
            eq(list_place_link.listId, listID),
            eq(list_place_link.placeId, placeID),
          ),
        );
    });
  } catch (error) {
    console.error("Error removing place from list:", error);

    return NextResponse.json(
      { error: "Failed to remove place from list" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message: "Place successfully removed from the list",
  });
}
