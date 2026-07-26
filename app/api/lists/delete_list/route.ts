import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { list_members, lists } from "@/db/schema";
import { and, eq } from "drizzle-orm";

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

  const { listID } = await request.json();

  try {
    await db.transaction(async (tx) => {
      const [userRole] = await tx
        .select()
        .from(list_members)
        .where(
          and(
            eq(list_members.listId, listID),
            eq(list_members.userId, session.user.id),
            eq(list_members.role, "Creator"),
          ),
        );

      if (!userRole) {
        throw new Error("User is not authorised to delete this list");
      }

      await tx.delete(lists).where(eq(lists.id, listID));
    });
  } catch (error) {
    console.error("Error deleting list:", error);

    return NextResponse.json(
      { error: "Failed to delete list" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message: "List successfully deleted",
  });
}
