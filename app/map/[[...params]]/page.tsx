import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { places, place_user_link } from "@/db/schema";
import { sql, and, eq } from "drizzle-orm";

import { InfoPaneProvider } from "@/components/map/InfoPaneContext";

import MapPageClient from "@/components/map/MapPageClient";
import MapPageSidebar from "@/components/map/Sidebar";
import MapPageInfoPane from "@/components/map/InfoPane";
import InfoPaneCloseKeybind from "@/components/map/InfoPaneCloseKeybind";
import SearchKeybind from "@/components/map/SearchKeybind";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { Search } from "lucide-react";

type MapPageProps = {
  params: Promise<{
    params?: string[];
  }>;
};

interface Place {
  id: string;
  placeName: string;
  longitude: number;
  latitude: number;
  favorite: boolean;
  visited: boolean;
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
      longitude: places.longitude,
      latitude: places.latitude,
      favorite: sql<boolean>`COALESCE(${place_user_link.favorite}, false)`,
      visited: sql<boolean>`COALESCE(${place_user_link.visited}, false)`,
    })
    .from(places)
    .leftJoin(
      place_user_link,
      and(
        eq(places.id, place_user_link.placeId),
        eq(place_user_link.userId, userId),
      ),
    );

  const placesGeoJSON = {
    type: "FeatureCollection" as const,
    features: placeData.map((place: Place) => ({
      type: "Feature" as const,

      properties: {
        id: place.id,
        placeName: place.placeName,
        longitude: place.longitude,
        latitude: place.latitude,
        favorite: place.favorite ?? false,
        visited: place.visited ?? false,
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
          <SearchKeybind />
          <InfoPaneCloseKeybind />

          <div className="flex flex-1 overflow-hidden">
            <main className="relative flex-1">
              <MapPageClient
                type={type}
                id={id}
                placesGeoJSON={placesGeoJSON}
              />

              <div className="absolute top-4 left-4 w-full max-w-90 z-20">
                <InputGroup className="p-1 py-5 bg-background">
                  <InputGroupInput
                    id="search-input"
                    placeholder="Search locations..."
                  />
                  <InputGroupAddon>
                    <Search className="h-4 w-4" />
                  </InputGroupAddon>
                  <InputGroupAddon
                    align="inline-end"
                    className="hidden lg:flex"
                  >
                    <Kbd>/</Kbd>
                  </InputGroupAddon>
                </InputGroup>
              </div>
            </main>

            <MapPageInfoPane />
          </div>
        </div>
      </div>
    </InfoPaneProvider>
  );
}

export default MapPage;
