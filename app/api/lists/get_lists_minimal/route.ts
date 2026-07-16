import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { lists, list_place_link } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json(
      { error: "Signed in user not found" },
      { status: 401 },
    );
  }

  try {
    const userLists = await db
      .select({
        id: lists.id,
        listName: lists.listName,
        listColor: lists.listColor,
        placeCount: count(list_place_link.placeId),
      })
      .from(lists)
      .leftJoin(list_place_link, eq(lists.id, list_place_link.listId))
      .where(eq(lists.creatorId, session.user.id))
      .groupBy(
        lists.id,
        lists.listName,
        lists.listColor,
        lists.createdAt,
      )
      .orderBy(desc(lists.createdAt));

    if (!userLists || userLists.length === 0) {
      return NextResponse.json({ lists: [] }, { status: 200 });
    }

    return NextResponse.json({ lists: userLists }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch user lists: ${error}` },
      { status: 500 },
    );
  }
}
