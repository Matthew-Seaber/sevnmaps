import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { lists } from "@/db/schema";

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

  const newList = await db
    .insert(lists)
    .values({
      creatorId: session.user.id,
      listName,
      listColor: listColor || "1273F6",
      listIcon: listIcon || null,
    })
    .returning({
      id: lists.id,
    });

  return NextResponse.json(
    {
      message: "List created successfully",
      id: newList[0].id,
      listName,
      listColor: listColor || "1273F6",
      listIcon: listIcon || null,
    },
    { status: 201 },
  );
}
