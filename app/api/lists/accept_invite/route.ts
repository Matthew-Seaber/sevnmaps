import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { list_invites, list_members } from "@/db/schema";
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
  const userID = session.user.id;

  try {
    await db.transaction(async (tx) => {
      const [invite] = await tx
        .delete(list_invites)
        .where(
          and(eq(list_invites.listId, listID), eq(list_invites.userId, userID)),
        )
        .returning({
          role: list_invites.role,
        });

      await tx.insert(list_members).values({
        listId: listID,
        userId: userID,
        role: invite.role,
      });
    });

    return NextResponse.json(
      { message: "Invitation successfully accepted" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error accepting invitation:", error);

    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 },
    );
  }
}
