import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

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
