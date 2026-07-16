import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { lists, list_place_link } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";

import TextLogo from "@/components/navbar/TextLogoLink";
import MapPageProfileSection from "@/components/map/ProfileSectionServer";
import SidebarButtons from "@/components/map/SidebarButtons";
import ListsComponent from "@/components/map/ListsComponent";

interface SidebarList {
  id: string;
  listName: string;
  listColor: string;
  placeCount: number;
}

async function MapPageSidebar() {
  let sidebarLists: SidebarList[] = [];

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  try {
    const userLists = await db
      .select({
        id: lists.id,
        listName: lists.listName,
        listColor: lists.listColor,
        placeCount: count(list_place_link.placeId),
      })
      .from(lists)
      .leftJoin(list_place_link, eq(lists.id, list_place_link.listId))
      .where(eq(lists.creatorId, session.user.id))
      .groupBy(lists.id, lists.listName, lists.listColor, lists.createdAt)
      .orderBy(desc(lists.createdAt));

    if (userLists && userLists.length > 0) {
      sidebarLists = userLists;
    }
  } catch (error) {
    console.error("Failed to fetch lists:", error);
  }

  return (
    <div className="hidden md:flex flex-col justify-between w-72 border-r-2 border-border p-6 shadow-xl">
      <div>
        <TextLogo link="/map" />

        <SidebarButtons />

        <ListsComponent sidebarLists={sidebarLists} />
      </div>

      <div className="w-full flex justify-center">
        <MapPageProfileSection />
      </div>
    </div>
  );
}

export default MapPageSidebar;
