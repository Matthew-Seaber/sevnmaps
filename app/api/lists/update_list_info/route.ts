import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { lists, list_members } from "@/db/schema";
import { and, inArray, eq } from "drizzle-orm";

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

  const { listID, newName, newDescription, newColor, newIcon } =
    await request.json();

  if (!listID) {
    return NextResponse.json({ error: "List ID is required" }, { status: 400 });
  }

  const userId = session.user.id;

  try {
    await db.transaction(async (tx) => {
      const [userRole] = await tx
        .select()
        .from(list_members)
        .where(
          and(
            eq(list_members.listId, listID),
            eq(list_members.userId, userId),
            inArray(list_members.role, ["Creator", "Admin"]),
          ),
        );

      if (!userRole) {
        throw new Error("User is not authorised to edit this list's details");
      }

      await tx
        .update(lists)
        .set({
          listName: newName,
          listDescription: newDescription,
          listColor: newColor,
          listIcon: newIcon,
        })
        .where(eq(lists.id, listID));
    });
  } catch (error) {
    console.error("Error updating list info:", error);

    return NextResponse.json(
      { error: "Failed to update list info" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message: "List info successfully updated",
  });
}
