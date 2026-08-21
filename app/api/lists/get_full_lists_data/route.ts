import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { lists, list_place_link, list_members, user } from "@/db/schema";
import { count, desc, and, eq, inArray, ne } from "drizzle-orm";

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

  const userID = session.user.id;

  return await db.transaction(async (tx) => {
    const createdLists = await tx
      .select({
        id: lists.id,
        name: lists.listName,
        color: lists.listColor,
        icon: lists.listIcon,
        createdAt: lists.createdAt,
        visibility: lists.visibility,
        placeCount: count(list_place_link.placeId),
        memberCount: count(list_members.userId),
      })
      .from(lists)
      .leftJoin(list_place_link, eq(lists.id, list_place_link.listId))
      .innerJoin(list_members, eq(lists.id, list_members.listId))
      .where(
        and(eq(list_members.userId, userID), eq(list_members.role, "Creator")),
      )
      .groupBy(
        lists.id,
        lists.listName,
        lists.listColor,
        lists.visibility,
        lists.createdAt,
      )
      .orderBy(desc(lists.createdAt));

    const sharedLists = await tx
      .select({
        id: lists.id,
        name: lists.listName,
        color: lists.listColor,
        icon: lists.listIcon,
        createdAt: lists.createdAt,
        visibility: lists.visibility,
        role: list_members.role,
        placeCount: count(list_place_link.placeId),
        memberCount: count(list_members.userId),
      })
      .from(lists)
      .leftJoin(list_place_link, eq(lists.id, list_place_link.listId))
      .innerJoin(list_members, eq(lists.id, list_members.listId))
      .where(
        and(
          eq(list_members.userId, userID),
          inArray(list_members.role, ["Admin", "Editor", "Viewer"]),
        ),
      )
      .groupBy(
        lists.id,
        lists.listName,
        lists.listColor,
        lists.createdAt,
        list_members.role,
      )
      .orderBy(desc(lists.createdAt));

    const recommendedLists = await tx
      .select({
        id: lists.id,
        name: lists.listName,
        color: lists.listColor,
        icon: lists.listIcon,
        createdAt: lists.createdAt,
        visibility: lists.visibility,
        creatorName: user.name,
        placeCount: count(list_place_link.placeId),
      })
      .from(lists)
      .leftJoin(list_place_link, eq(list_place_link.listId, lists.id))
      .innerJoin(list_members, eq(list_members.listId, lists.id))
      .innerJoin(user, eq(list_members.userId, user.id))
      .where(
        and(eq(lists.visibility, "Public"), eq(list_members.role, "Creator"), ne(list_members.userId, user.id)),
      )
      .groupBy(
        lists.id,
        lists.listName,
        lists.listColor,
        lists.listIcon,
        user.name,
      )
      .orderBy(desc(count(list_place_link.placeId)))
      .limit(5);

    return NextResponse.json({
      createdLists,
      sharedLists,
      recommendedLists,
    });
  });
}
