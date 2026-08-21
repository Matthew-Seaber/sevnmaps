import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { lists, list_members } from "@/db/schema";
import { eq } from "drizzle-orm";

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
      const [visibilityCheck] = await tx
        .select({
          visibility: lists.visibility,
        })
        .from(lists)
        .where(eq(lists.id, listID));

      if (visibilityCheck.visibility !== "Public") {
        return NextResponse.json(
          { error: "User not authorised to join this list" },
          { status: 400 },
        );
      }

      await tx.insert(list_members).values({
        userId: userID,
        listId: listID,
      });
    });

    return NextResponse.json(
      { message: "Successfully joined list" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error joining list:", error);

    return NextResponse.json({ error: "Failed to join list" }, { status: 500 });
  }
}
