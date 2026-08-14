import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  list_invites,
  list_members,
  user,
  lists,
  notifications,
} from "@/db/schema";
import { and, inArray, eq } from "drizzle-orm";

export async function POST(request: Request) {
  const { listID, email, role } = await request.json();

  if (!listID || !email || !role) {
    return NextResponse.json(
      { error: "Missing parameter(s)" },
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

  const userId = session.user.id;

  try {
    await db.transaction(async (tx) => {
      const [userRole] = await tx
        .select()
        .from(list_members)
        .where(
          and(
            eq(list_members.listId, listID),
            eq(list_members.userId, userId),
            inArray(list_members.role, ["Creator", "Admin"]),
          ),
        );

      if (!userRole) {
        throw new Error(
          "User is not authorised to remove a member from this list",
        );
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

      const highestPlanData = await fetch(
        "/api/billing/get_highest_plan_info?userIDs=" +
          [userId, creatorData.userId].join(","),
      );

      if (!highestPlanData.ok) {
        throw new Error("Failed to fetch highest plan info");
      }

      const highestPlanInfo = await highestPlanData.json();
      const highestPlanType = highestPlanInfo.planType;

      if (highestPlanType === "free") {
        throw new Error(
          "403: Collaboration unauthorised on the current user's and owner's plan",
        );
      }

      const [recipientUser] = await tx
        .select({
          id: user.id,
        })
        .from(user)
        .where(eq(user.email, email));

      if (!recipientUser || recipientUser.id === userId) {
        throw new Error("Failed to invite user");
      }

      await tx.insert(list_invites).values({
        listId: listID,
        userId: recipientUser.id,
        invitedBy: userId,
        role: role,
      });

      const [listDetails] = await tx
        .select({
          name: lists.listName,
        })
        .from(lists)
        .where(eq(lists.id, listID));

      await tx.insert(notifications).values({
        userId: recipientUser.id,
        title: "You've been invited to a list!",
        message: `You have been invited to the list '${listDetails.name}' as a${role === "Viewer" ? "" : "n"} ${role.toLowerCase()} by ${session.user.name}. Click to accept or decline the invitation.`,
        link: "https://sevnmaps.com/invite/" + listID,
      });
    });
  } catch (error) {
    console.error("Error inviting user:", error);

    return NextResponse.json(
      { error: "Failed to invite user" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      message: "User successfully invited to the list",
    },
    { status: 200 },
  );
}
