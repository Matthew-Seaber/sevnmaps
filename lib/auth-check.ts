import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function checkAuthLoginRedirect() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function checkAuthMapRedirect() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/map");
  }
}

export async function protectAdminPages() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const userRoleFetch = await db.query.profiles.findFirst({
    where: eq(profiles.userId, session.user.id),
  });

  if (userRoleFetch?.role !== "admin") {
    redirect("/map");
  }
}
