import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  places,
  place_user_link,
  list_place_link,
  list_members,
  lists,
  countries,
  subscriptions,
} from "@/db/schema";
import { sql, and, eq, desc, count } from "drizzle-orm";

import { InfoPaneProvider } from "@/components/map/InfoPaneContext";
import { MobileSidebarProvider } from "@/components/map/MobileSidebarContext";

import MapPageClient from "@/components/map/MapPageClient";
import MapPageSidebar from "@/components/map/Sidebar";
import MapPageSheet from "@/components/map/SidebarMobile";
import MapPageInfoPane from "@/components/map/InfoPane";
import InfoPaneCloseKeybind from "@/components/map/InfoPaneCloseKeybind";
import { SearchOpenKeybind } from "@/components/map/SearchKeybind";

type MapPageProps = {
  params: Promise<{
    params?: string[];
  }>;
};

interface Place {
  id: string;
  placeName: string;
  address: string;
  longitude: number;
  latitude: number;
  favorite: boolean;
  visited: boolean;
  inList: boolean;
  listColor?: string | null;
  createdAt: Date;
}

interface SidebarList {
  id: string;
  listName: string;
  listColor: string;
  placeCount: number;
}

async function MapPage({ params }: MapPageProps) {
  const resolvedParams = await params;

  const type = resolvedParams.params?.[0];
  const id = resolvedParams.params?.[1];

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;

  const [placeData, userLists, planInfo] = await Promise.all([
    db
      .select({
        id: places.id,
        placeName: places.placeName,
        address: sql<string>`CONCAT_WS(', ', NULLIF(${places.mainAddress}, ''), NULLIF(${places.city}, ''), NULLIF(${places.state}, ''), NULLIF(${countries.countryName}, ''), NULLIF(${places.zipCode}, ''))`,
        longitude: places.longitude,
        latitude: places.latitude,
        favorite: sql<boolean>`COALESCE(${place_user_link.favorite}, false)`,
        visited: sql<boolean>`COALESCE(${place_user_link.visited}, false)`,
        inList: sql<boolean>`EXISTS (SELECT 1 FROM ${list_place_link} INNER JOIN ${list_members} ON ${list_place_link.listId} = ${list_members.listId} WHERE ${list_place_link.placeId} = ${places.id} AND ${list_members.userId} = ${userId} AND ${list_members.role} IN ('Creator', 'Admin', 'Editor'))`,
        listColor: sql<
          string | null
        >`(SELECT ${lists.listColor} FROM ${list_place_link} INNER JOIN ${list_members} ON ${list_place_link.listId} = ${list_members.listId} INNER JOIN ${lists} ON ${list_place_link.listId} = ${lists.id} WHERE ${list_place_link.placeId} = ${places.id} AND ${list_members.userId} = ${userId} AND ${list_members.role} IN ('Creator', 'Admin', 'Editor') ORDER BY ${list_members.joinedAt} ASC LIMIT 1)`,
        createdAt: places.createdAt,
      })
      .from(places)
      .leftJoin(
        place_user_link,
        and(
          eq(places.id, place_user_link.placeId),
          eq(place_user_link.userId, userId),
        ),
      )
      .leftJoin(countries, eq(places.countryId, countries.id)),

    db
      .select({
        id: lists.id,
        listName: lists.listName,
        listColor: lists.listColor,
        placeCount: count(list_place_link.placeId),
      })
      .from(lists)
      .leftJoin(list_place_link, eq(lists.id, list_place_link.listId))
      .leftJoin(list_members, eq(lists.id, list_members.listId))
      .where(eq(list_members.userId, userId))
      .groupBy(lists.id, lists.listName, lists.listColor, lists.createdAt)
      .orderBy(desc(lists.createdAt)),

    db
      .select({
        planType: subscriptions.planType,
      })
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1),
  ]);

  const placesGeoJSON = {
    type: "FeatureCollection" as const,
    features: placeData.map((place: Place) => ({
      type: "Feature" as const,

      properties: {
        id: place.id,
        placeName: place.placeName,
        address: place.address,
        longitude: place.longitude,
        latitude: place.latitude,
        favorite: place.favorite ?? false,
        visited: place.visited ?? false,
        inList: place.inList ?? false,
        listColor: place.listColor ?? null,
      },

      geometry: {
        type: "Point" as const,
        coordinates: [place.longitude, place.latitude] as [number, number],
      },
    })),
  };

  let sidebarLists: SidebarList[] = [];

  if (userLists && userLists.length > 0) {
    sidebarLists = userLists;
  }

  const sidebarListsKey = sidebarLists.map((list) => list.id).join("|");

  const planName = planInfo[0]?.planType || "free";
  const advancedMapStyles =
    planName.startsWith("pro") || planName.startsWith("explorer");

  return (
    <InfoPaneProvider>
      <MobileSidebarProvider>
        <div className="flex h-screen">
          <div className="hidden md:flex">
            <MapPageSidebar
              placeData={placeData}
              listsKey={sidebarListsKey}
              sidebarLists={sidebarLists}
            />
          </div>

          <div className="flex md:hidden">
            <MapPageSheet
              placeData={placeData}
              listsKey={sidebarListsKey}
              sidebarLists={sidebarLists}
            />
          </div>

          <div className="flex flex-1 flex-col">
            <SearchOpenKeybind />
            <InfoPaneCloseKeybind />

            <div className="flex flex-1 overflow-hidden">
              <main className="relative flex-1">
                <MapPageClient
                  type={type}
                  id={id}
                  placesGeoJSON={placesGeoJSON}
                  advancedMapStyles={advancedMapStyles}
                />
              </main>

              <MapPageInfoPane />
            </div>
          </div>
        </div>
      </MobileSidebarProvider>
    </InfoPaneProvider>
  );
}

export default MapPage;
