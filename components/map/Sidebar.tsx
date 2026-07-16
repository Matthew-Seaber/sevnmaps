import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { lists, list_place_link } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";

import TextLogo from "@/components/navbar/TextLogoLink";
import MapPageProfileSection from "@/components/map/ProfileSectionServer";
import SidebarButtons from "@/components/map/SidebarButtons";

import { Button } from "@/components/ui/button";

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
    <div className="hidden md:flex flex-col w-72 border-r-2 border-border p-6 shadow-xl">
      <TextLogo link="/map" />

      <SidebarButtons />

      <div className="flex flex-col gap-0.5 mt-6">
        <div className="flex items-center gap-3 pb-2">
          <h3 className="text-sm font-medium pl-3">YOUR LISTS</h3>
          <div className="h-px flex-1 bg-border" />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 font-semibold text-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
          >
            +
          </Button>
        </div>
        {sidebarLists.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center">
            No lists found
          </p>
        ) : (
          <div className="flex flex-col gap-0.5 px-1">
            {sidebarLists.map((list) => {
              return (
                <div
                  key={list.id}
                  className="flex flex-row justify-between items-center hover:bg-primary/10 cursor-default rounded-lg px-3 py-1"
                >
                  <div className="flex flex-row items-center gap-3">
                    <span
                      className={`inline-block w-2 h-2 rounded-full`}
                      style={{ backgroundColor: `#${list.listColor}` }}
                    />
                    <p className="font-semibold text-sm">{list.listName}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      {list.placeCount}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <MapPageProfileSection />
    </div>
  );
}

export default MapPageSidebar;
