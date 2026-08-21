import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { list_members, lists, notifications } from "@/db/schema";
import { and, eq } from "drizzle-orm";

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

  const { listID } = await request.json();

  try {
    await db.transaction(async (tx) => {
      await tx
        .delete(list_members)
        .where(
          and(
            eq(list_members.listId, listID),
            eq(list_members.userId, session.user.id),
          ),
        );

      const [ownerInfo] = await tx
        .select({
          userId: list_members.userId,
          listName: lists.listName,
        })
        .from(list_members)
        .innerJoin(lists, eq(list_members.listId, lists.id))
        .where(
          and(eq(list_members.listId, listID), eq(list_members.role, "Creator")),
        );

      await tx.insert(notifications).values({
        userId: ownerInfo.userId,
        title: `${session.user.name} has left your list '${ownerInfo.listName}'`,
      });
    });
  } catch (error) {
    console.error("Error leaving list:", error);

    return NextResponse.json(
      { error: "Failed to leave list" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message:
      "User has successfully left the list and the owner has been notified",
  });
}
