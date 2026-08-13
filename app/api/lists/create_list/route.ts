import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { lists, list_members, subscriptions } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(request: Request) {
  const body = await request.json();
  const { listName, listColor, listIcon } = body;

  if (!listName) {
    return NextResponse.json(
      { error: "Missing parameter (listName)" },
      { status: 400 },
    );
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json(
      { error: "Signed in user not found" },
      { status: 401 },
    );
  }

  let result;
  const userId = session.user.id;

  try {
    result = await db.transaction(async (tx) => {
      const eligibilityCheck = await tx
        .select({
          planType: subscriptions.planType,
        })
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId));

      let allowedLists = 0;
      const planType = eligibilityCheck[0]?.planType;

      if (planType === "free") {
        allowedLists = 5;
      } else if (planType.startsWith("pro")) {
        allowedLists = 25;
      } else if (planType.startsWith("explorer")) {
        allowedLists = 999;
      }

      const currentListCount = await tx
        .select()
        .from(list_members)
        .where(
          and(
            eq(list_members.userId, userId),
            eq(list_members.role, "Creator"),
          ),
        );

      if (currentListCount.length >= allowedLists) {
        throw new Error(
          "403: User has reached the maximum allowed number of lists for their subscription plan",
        );
      }

      const [newList] = await tx
        .insert(lists)
        .values({
          listName,
          listColor: listColor || "1273F6",
          listIcon: listIcon || null,
        })
        .returning({
          id: lists.id,
        });

      await tx.insert(list_members).values({
        listId: newList.id,
        userId: userId,
        role: "Creator",
      });

      return newList;
    });
  } catch (error) {
    console.error("Failed to create list:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.startsWith("403")) {
      return NextResponse.json(
        { error: "User has reached the maximum allowed number of lists" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create list" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      message: "List created successfully",
      id: result.id,
      listName,
      listColor: listColor || "1273F6",
      listIcon: listIcon || null,
    },
    { status: 201 },
  );
}
