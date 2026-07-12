import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

import SettingsForm from "@/components/settings/SettingsForm";

async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, session.user.id),
  });

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl sm:text-3xl font-semibold mt-8 mb-2">Settings</h1>
      <p className="mb-8">Amend your account and app setting here.</p>

      <SettingsForm
        userInfo={{
          name: session.user.name ?? "",
          username: profile?.username ?? "",
          email: session.user.email,
        }}
      />
    </div>
  );
}

export default SettingsPage;
