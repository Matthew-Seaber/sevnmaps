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
} from "@/db/schema";
import { sql, and, eq } from "drizzle-orm";

import { InfoPaneProvider } from "@/components/map/InfoPaneContext";

import MapPageClient from "@/components/map/MapPageClient";
import MapPageSidebar from "@/components/map/Sidebar";
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

  const placeData = await db
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
    })
    .from(places)
    .leftJoin(
      place_user_link,
      and(
        eq(places.id, place_user_link.placeId),
        eq(place_user_link.userId, userId),
      ),
    )
    .leftJoin(countries, eq(places.countryId, countries.id));

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

  return (
    <InfoPaneProvider>
      <div className="flex h-screen">
        <MapPageSidebar />

        <div className="flex flex-1 flex-col">
          <SearchOpenKeybind />
          <InfoPaneCloseKeybind />

          <div className="flex flex-1 overflow-hidden">
            <main className="relative flex-1">
              <MapPageClient
                type={type}
                id={id}
                placesGeoJSON={placesGeoJSON}
              />
            </main>

            <MapPageInfoPane />
          </div>
        </div>
      </div>
    </InfoPaneProvider>
  );
}

export default MapPage;
