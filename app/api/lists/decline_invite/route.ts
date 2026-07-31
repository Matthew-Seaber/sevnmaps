import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { list_invites } from "@/db/schema";
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
    await db
      .delete(list_invites)
      .where(
        and(eq(list_invites.listId, listID), eq(list_invites.userId, userID)),
      );

    return NextResponse.json(
      { message: "Invitation successfully declined" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error declining invitation:", error);

    return NextResponse.json(
      { error: "Failed to decline invitation" },
      { status: 500 },
    );
  }
}
