import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { lists, list_members } from "@/db/schema";

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

  try {
    result = await db.transaction(async (tx) => {
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
        userId: session.user.id,
        role: "Creator",
      });

      return newList;
    });
  } catch (error) {
    console.error("Failed to create list:", error);

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
