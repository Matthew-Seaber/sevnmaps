"use client";

import { useEffect, useState, useRef } from "react";

import {
  useInfoPaneActions,
  useInfoPaneState,
} from "@/components/map/InfoPaneContext";
import { useMobileSidebar } from "@/components/map/MobileSidebarContext";

import Map from "./Map";

import Image from "next/image";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Layers, Search, Lock, Menu } from "lucide-react";
import { Separator } from "../ui/separator";

type MapPageProps = {
  type?: string;
  id?: string;
  placesGeoJSON: {
    type: "FeatureCollection";
    features: {
      type: "Feature";
      properties: {
        id: string;
        placeName: string;
        address: string;
        longitude: number;
        latitude: number;
        favorite: boolean;
        visited: boolean;
        inList: boolean;
        listColor?: string | null;
      };

      geometry: {
        type: "Point";
        coordinates: [number, number];
      };
    }[];
  };

  advancedMapStyles: boolean;
};

export default function MapPageClient({
  type,
  id,
  placesGeoJSON,
  advancedMapStyles,
}: MapPageProps) {
  const { openPane } = useInfoPaneActions();
  const infoPaneState = useInfoPaneState();
  const {
    mobileSidebarState,
    openPane: openSidebar,
    closePane: closeSidebar,
  } = useMobileSidebar();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [highlightedSearchResult, setHighlightedSearchResult] = useState<
    string | null
  >(null);
  const [mapType, setMapType] = useState<"default" | "satellite" | "outdoors">(
    "default",
  );
  const [immersiveMap, setImmersiveMap] = useState(false);
  const [nightMap, setNightMap] = useState(false);
  const [mapStylesDialogOpen, setMapStylesDialogOpen] = useState(false);
  const lastRoute = useRef<string | null>(null);

  useEffect(() => {
    if (type !== "place" || !id) {
      lastRoute.current = null;
      return;
    }

    const newRoute = `${type}:${id}`;

    if (lastRoute.current === newRoute) {
      return;
    }

    lastRoute.current = newRoute;
    openPane({ type: "place", placeID: id });
  }, [type, id, openPane]);

  function searchPlaces(query?: string) {
    if (!query || query.trim() === "") {
      setSearchResults([]);
      return;
    }

    query = query.toLowerCase();
    const potentialPlaces: string[] = [];

    for (const feature of placesGeoJSON.features) {
      const name = feature.properties.placeName.toLowerCase();
      const address = feature.properties.address.toLowerCase();

      if (name.includes(query) || address.includes(query)) {
        const { id } = feature.properties;
        potentialPlaces.push(id);
      }
    }

    setSearchResults(potentialPlaces);
    setHighlightedSearchResult(
      potentialPlaces.length > 0 ? potentialPlaces[0] : null,
    );
  }

  function handleQuickSearch() {
    openPane({
      type: "place",
      placeID: highlightedSearchResult || searchResults[0],
    });

    setSearchQuery("");
    setHighlightedSearchResult(null);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const activeElement = document.activeElement as HTMLElement;

      if (activeElement.tagName !== "INPUT") {
        return;
      }

      if (event.key === "Enter" && activeElement?.tagName === "INPUT") {
        event.preventDefault();

        handleQuickSearch();
      }

      if (event.key === "ArrowDown" && activeElement?.tagName === "INPUT") {
        event.preventDefault();

        setHighlightedSearchResult((prev) => {
          if (!prev) {
            return searchResults[0];
          }

          const currentIndex = searchResults.indexOf(prev);
          const newIndex = (currentIndex + 1) % searchResults.length;

          return searchResults[newIndex];
        });
      }

      if (event.key === "ArrowUp" && activeElement?.tagName === "INPUT") {
        event.preventDefault();

        setHighlightedSearchResult((prev) => {
          if (!prev) {
            return searchResults[0];
          }

          const currentIndex = searchResults.indexOf(prev);
          const newIndex =
            (currentIndex - 1 + searchResults.length) % searchResults.length;

          return searchResults[newIndex];
        });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <>
      <Map
        placesGeoJSON={placesGeoJSON}
        mapType={mapType}
        immersiveMap={immersiveMap}
        nightMap={nightMap}
      />

      <div className="absolute top-4 left-4 right-4 md:right-auto w-auto md:w-full md:max-w-120 z-20">
        <div className="flex flex-row gap-2 items-center w-full">
          <div className="flex md:hidden">
            {infoPaneState.type === "closed" ? (
              <Button
                variant="outline"
                className="size-10"
                onClick={() => {
                  if (mobileSidebarState.type === "open") {
                    closeSidebar();
                  } else {
                    openSidebar();
                  }
                }}
              >
                <Menu />
              </Button>
            ) : null}
          </div>

          <div className="flex-1 min-w-0 max-w-90">
            <InputGroup className="h-10 px-1 bg-background">
              <InputGroupInput
                id="search-input"
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => {
                  const query = e.target.value;

                  setSearchQuery(query);
                  searchPlaces(query);
                }}
              />
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupAddon align="inline-end" className="hidden lg:flex">
                <Kbd>/</Kbd>
              </InputGroupAddon>
            </InputGroup>

            {searchQuery && searchResults.length > 0 ? (
              <div className="flex flex-col gap-2 bg-background mt-1 rounded-md p-2 max-h-60 overflow-y-scroll">
                {searchResults.slice(0, 10).map((id) => (
                  <div
                    key={id}
                    onClick={() => {
                      openPane({ type: "place", placeID: id });

                      setSearchQuery("");
                      setHighlightedSearchResult(null);
                    }}
                    onMouseEnter={() => setHighlightedSearchResult(id)}
                    className={`flex flex-row gap-2 h-10 p-2 rounded-sm items-center cursor-pointer ${highlightedSearchResult === id ? "bg-accent" : ""}`}
                  >
                    <h4 className="text-sm font-medium shrink-0 truncate">
                      {placesGeoJSON.features.find(
                        (feature) => feature.properties.id === id,
                      )?.properties.placeName || "Error"}
                    </h4>

                    <p className="text-sm text-muted-foreground min-w-0 truncate">
                      {placesGeoJSON.features.find(
                        (feature) => feature.properties.id === id,
                      )?.properties.address || "Error"}
                    </p>
                  </div>
                ))}
              </div>
            ) : searchQuery && searchResults.length === 0 ? (
              <p className="bg-background mt-1 rounded-md p-3 text-center font-medium text-sm text-muted-foreground">
                No results found.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={() => setMapStylesDialogOpen(true)}
        className="absolute bottom-12 left-4 w-15 h-15 z-20"
      >
        <Layers className="w-6! h-6! text-foreground/90" />
      </Button>

      <Dialog open={mapStylesDialogOpen} onOpenChange={setMapStylesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Map styles</DialogTitle>
          </DialogHeader>

          <div
            onWheel={(e) => (e.currentTarget.scrollLeft += e.deltaY / 2)}
            className="flex overflow-x-auto gap-4 pb-4"
          >
            <Button
              variant="outline"
              onClick={() => setMapType("default")}
              className={`relative h-20 w-20 shrink-0 overflow-hidden ${mapType === "default" ? "border-3 border-primary" : ""}`}
            >
              <Image
                src="/assets/map-types/default.png"
                alt="Default map style"
                fill
                sizes={"80px"}
                draggable={false}
                className="object-cover"
              />

              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent pb-2">
                <p className="font-semibold text-white text-xs z-20">Default</p>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => setMapType("satellite")}
              className={`relative h-20 w-20 shrink-0 overflow-hidden ${mapType === "satellite" ? "border-3 border-primary" : ""}`}
            >
              <Image
                src="/assets/map-types/satellite.png"
                alt="Satellite map style"
                fill
                sizes={"80px"}
                draggable={false}
                className="object-cover"
              />

              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent pb-2">
                <p className="font-semibold text-white text-xs z-20">
                  Satellite
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              disabled={!advancedMapStyles}
              onClick={() => setMapType("outdoors")}
              className={`relative h-20 w-20 shrink-0 overflow-hidden ${mapType === "outdoors" ? "border-3 border-primary" : ""}`}
            >
              <Image
                src="/assets/map-types/outdoors.png"
                alt="Outdoors map style"
                fill
                sizes={"80px"}
                draggable={false}
                className="object-cover"
              />
              {!advancedMapStyles && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent pb-2">
                <p className="font-semibold text-white text-xs z-20">
                  Outdoors
                </p>
              </div>
            </Button>
          </div>

          <Separator />

          <div
            onWheel={(e) => (e.currentTarget.scrollLeft += e.deltaY / 2)}
            className="flex overflow-x-auto gap-4 pb-4"
          >
            <Button
              variant="outline"
              disabled={!advancedMapStyles}
              onClick={() => setImmersiveMap((prev) => !prev)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden ${immersiveMap ? "border-3 border-primary" : ""}`}
            >
              <Image
                src="/assets/map-types/3d.png"
                alt="3D view"
                fill
                sizes={"80px"}
                draggable={false}
                className="object-cover"
              />
              {!advancedMapStyles && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent pb-2">
                <p className="font-semibold text-white text-xs z-20">3D view</p>
              </div>
            </Button>

            <Button
              variant="outline"
              disabled={!advancedMapStyles}
              onClick={() => setNightMap((prev) => !prev)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden ${nightMap ? "border-3 border-primary" : ""}`}
            >
              <Image
                src="/assets/map-types/night.png"
                alt="Night mode"
                fill
                sizes={"80px"}
                draggable={false}
                className="object-cover"
              />
              {!advancedMapStyles && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent pb-2">
                <p className="font-semibold text-white text-xs z-20">Night</p>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
