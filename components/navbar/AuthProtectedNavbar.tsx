import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

import NavbarMenu from "./NavbarMenu";
import TextLogo from "./TextLogoLink";

interface Notification {
  id: string;
  title: string;
  message: string;
  sent: string;
  link: string;
  read: boolean;
}

async function AuthProtectedNavbar() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const fetchedNotifications = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, session.user.id))
    .orderBy(desc(notifications.sentAt));

  const notificationData: Notification[] = fetchedNotifications.map(
    (notification) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message ?? "",
      sent: notification.sentAt.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      link: notification.link ?? "",
      read: notification.read,
    }),
  );

  const profileLink = session.user.image || "";
  const name = session.user.name;

  return (
    <nav className="z-2">
      <div className="mx-auto max-w-[1800px] px-4 sm:px-6 flex justify-between items-center py-4 sm:py-6 gap-3">
        <TextLogo link="/map" />
        <NavbarMenu
          profileLink={profileLink}
          name={name}
          notifications={notificationData}
        />
      </div>
    </nav>
  );
}

export default AuthProtectedNavbar;
