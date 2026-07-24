import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  lists,
  places,
  list_place_link,
  place_images,
  list_members,
  countries,
  user,
} from "@/db/schema";
import { sql, and, eq } from "drizzle-orm";

export async function GET(request: Request) {
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

  const url = new URL(request.url);
  const listID = url.searchParams.get("listID");

  if (!listID) {
    return NextResponse.json(
      { error: "Missing listID parameter" },
      { status: 400 },
    );
  }

  const listInfo = await db
    .select({
      id: lists.id,
      name: lists.listName,
      createdAt: lists.createdAt,
      updatedAt: lists.updatedAt,
      visibility: lists.visibility,
      listColor: lists.listColor,
      listIcon: lists.listIcon,
    })
    .from(lists)
    .leftJoin(list_members, eq(lists.id, list_members.listId))
    .where(and(eq(lists.id, listID), eq(list_members.userId, userID)))
    .limit(1);

  if (listInfo.length === 0) {
    return NextResponse.json(
      { error: "List not found or access denied" },
      { status: 404 },
    );
  }

  const list = listInfo[0];

  const [listItems, listMembers] = await Promise.all([
    db
      .select({
        id: places.id,
        name: places.placeName,
        imageURL: place_images.imageURL,
        address: sql<string>`${places.city} || ', ' || ${countries.countryName}`,
        addedAt: list_place_link.addedAt,
        addedBy: list_place_link.addedBy,
      })
      .from(list_place_link)
      .innerJoin(places, eq(list_place_link.placeId, places.id))
      .innerJoin(countries, eq(countries.id, places.countryId))
      .leftJoin(
        place_images,
        and(
          eq(place_images.placeId, places.id),
          eq(place_images.primaryImage, true),
        ),
      )
      .where(eq(list_place_link.listId, listID)),

    db
      .select({
        id: list_members.userId,
        name: user.name,
        profileImageURL: user.image,
        role: list_members.role,
        joinedAt: list_members.joinedAt,
      })
      .from(list_members)
      .innerJoin(user, eq(list_members.userId, user.id))
      .where(eq(list_members.listId, listID)),
  ]);

  const listData = {
    name: list.name,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
    visibility: list.visibility,
    listColor: list.listColor,
    listIcon: list.listIcon,
    items: listItems,
    members: listMembers,
  };

  return NextResponse.json({ listData, userID });
}
