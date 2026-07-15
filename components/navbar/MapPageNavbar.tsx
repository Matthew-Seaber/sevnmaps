import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

import NavbarMenu from "./NavbarMenu";
import SearchKeybind from "@/components/map/SearchKeybind";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { Search } from "lucide-react";

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
    <nav className="z-2 border-b-2 border-border">
      <SearchKeybind />

      <div className="px-4 sm:px-6 flex justify-between items-center py-4 gap-3">
        <div className="relative w-full max-w-90">
          <InputGroup className="p-1 py-5">
            <InputGroupInput
              id="search-input"
              placeholder="Search locations..."
            />
            <InputGroupAddon>
              <Search className="h-4 w-4" />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end" className="hidden lg:flex">
              <Kbd>/</Kbd>
            </InputGroupAddon>
          </InputGroup>
        </div>

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
