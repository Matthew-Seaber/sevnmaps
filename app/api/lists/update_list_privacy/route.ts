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

  const { listID, newPrivacy } = await request.json();

  if (!listID) {
    return NextResponse.json({ error: "List ID is required" }, { status: 400 });
  }

  if (
    newPrivacy !== "Public" &&
    newPrivacy !== "Private" &&
    newPrivacy !== "Shared" &&
    newPrivacy !== "Paid access"
  ) {
    return NextResponse.json(
      { error: "Invalid privacy option" },
      { status: 400 },
    );
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
        throw new Error(
          "User is not authorised to edit this list's privacy type",
        );
      }

      await tx
        .update(lists)
        .set({ visibility: newPrivacy })
        .where(eq(lists.id, listID));

      if (newPrivacy === "Private") {
        await tx.delete(list_members).where(eq(list_members.listId, listID));
      }
    });
  } catch (error) {
    console.error("Error updating list privacy:", error);

    return NextResponse.json(
      { error: "Failed to update list privacy" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message: "List privacy successfully updated",
  });
}
