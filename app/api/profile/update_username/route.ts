import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(request: Request) {
  const { username } = await request.json();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json(
      { error: "Signed in user not found" },
      { status: 401 },
    );
  }

  await db
    .update(profiles)
    .set({ username })
    .where(eq(profiles.userId, session.user.id));

  return NextResponse.json(
    { message: "Username updated successfully" },
    { status: 200 },
  );
}
