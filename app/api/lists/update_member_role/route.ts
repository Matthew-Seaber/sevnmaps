import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { list_members } from "@/db/schema";
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

  const { listID, memberID, newRole } = await request.json();

  if (!listID || !memberID || !newRole) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  if (newRole !== "Creator" && newRole !== "Admin" && newRole !== "Editor" && newRole !== "Viewer") {
    return NextResponse.json({ error: "Invalid role option" }, { status: 400 });
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
        throw new Error("User is not authorised to update a member's role in this list");
      }

      await tx
        .update(list_members)
        .set({
          role: newRole,
        })
        .where(
          and(
            eq(list_members.listId, listID),
            eq(list_members.userId, memberID),
          ),
        );
    });
  } catch (error) {
    console.error("Error updating member role:", error);

    return NextResponse.json(
      { error: "Failed to update member role" },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: "Member role successfully updated" });
}
