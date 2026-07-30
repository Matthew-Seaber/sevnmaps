import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { list_invites, user, lists } from "@/db/schema";
import { and, eq } from "drizzle-orm";

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
      { error: "Missing parameter: listID" },
      { status: 400 },
    );
  }

  try {
    const [inviteDetails] = await db
      .select({
        invitedBy: list_invites.invitedBy,
        invitedAt: list_invites.invitedAt,
        role: list_invites.role,
      })
      .from(list_invites)
      .where(
        and(eq(list_invites.listId, listID), eq(list_invites.userId, userID)),
      );

    if (!inviteDetails) {
      return NextResponse.json(
        { error: "Invite details not found for signed in user" },
        { status: 404 },
      );
    }

    const [inviterDetails] = await db
      .select({
        name: user.name,
      })
      .from(user)
      .where(eq(user.id, inviteDetails.invitedBy));

    const [listDetails] = await db
      .select({
        name: lists.listName,
        description: lists.listDescription,
      })
      .from(lists)
      .where(eq(lists.id, listID));

    if (!listDetails || !inviterDetails) {
      return NextResponse.json(
        { error: "Missing list information" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      listName: listDetails.name,
      listDescription: listDetails.description || "",
      invitedBy: inviterDetails.name,
      invitedAt: inviteDetails.invitedAt,
      role: inviteDetails.role,
    });
  } catch (error) {
    console.error("Error fetching invite details:", error);

    return NextResponse.json(
      { error: "An error occurred while fetching invite details" },
      { status: 500 },
    );
  }
}
