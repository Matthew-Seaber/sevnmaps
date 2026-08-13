import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { list_place_link, list_members, subscriptions } from "@/db/schema";
import { and, eq, inArray, sql } from "drizzle-orm";

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

  const { listID, placeID } = await request.json();

  if (!listID || !placeID) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const userID = session.user.id;

  try {
    await db.transaction(async (tx) => {
      const [userRole] = await tx
        .select()
        .from(list_members)
        .where(
          and(
            eq(list_members.listId, listID),
            eq(list_members.userId, userID),
            inArray(list_members.role, ["Creator", "Admin", "Editor"]),
          ),
        );

      if (!userRole) {
        throw new Error("User is not authorised to add a place to this list");
      }

      const [creatorData] = await tx
        .select({
          userId: list_members.userId,
        })
        .from(list_members)
        .where(
          and(
            eq(list_members.listId, listID),
            eq(list_members.role, "Creator"),
          ),
        );

      if (!creatorData) {
        throw new Error("List creator not found");
      }

      const subscriptionsData = await tx
        .select({
          userId: subscriptions.userId,
          planType: subscriptions.planType,
        })
        .from(subscriptions)
        .where(inArray(subscriptions.userId, [userID, creatorData.userId]));

      let userAllowedPlaces = 0;
      let creatorAllowedPlaces = 0;

      const userPlanType =
        subscriptionsData.find((sub) => sub.userId === userID)?.planType ||
        "free";
      const creatorPlanType =
        subscriptionsData.find((sub) => sub.userId === creatorData.userId)
          ?.planType || "free";

      if (userPlanType === "free") {
        userAllowedPlaces = 30;
      } else if (userPlanType.startsWith("pro")) {
        userAllowedPlaces = 150;
      } else if (userPlanType.startsWith("explorer")) {
        userAllowedPlaces = 9999;
      }

      if (creatorPlanType === "free") {
        creatorAllowedPlaces = 30;
      } else if (creatorPlanType.startsWith("pro")) {
        creatorAllowedPlaces = 150;
      } else if (creatorPlanType.startsWith("explorer")) {
        creatorAllowedPlaces = 9999;
      }

      const allowedPlaces = Math.max(userAllowedPlaces, creatorAllowedPlaces);

      const [currentPlaceCount] = await tx
        .select({
          count: sql<number>`COUNT(*)`,
        })
        .from(list_place_link)
        .where(eq(list_place_link.listId, listID));

      if (currentPlaceCount.count >= allowedPlaces) {
        throw new Error(
          "403: List creator has reached the maximum allowed number of places for their subscription plan",
        );
      }

      await tx.insert(list_place_link).values({
        listId: listID,
        placeId: placeID,
        addedBy: userID,
      });
    });
  } catch (error) {
    console.error("Error adding place to list:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.startsWith("403")) {
      return NextResponse.json(
        {
          error:
            "User has reached the maximum allowed number of places on this list",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "Failed to add place to list" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { message: "Place successfully added to list" },
    { status: 200 },
  );
}
