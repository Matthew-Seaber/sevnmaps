"use client";

import { useEffect, useState, useRef } from "react";

import { useInfoPaneActions } from "@/components/map/InfoPaneContext";
import Map from "./Map";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { Search } from "lucide-react";

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
};

export default function MapPageClient({
  type,
  id,
  placesGeoJSON,
}: MapPageProps) {
  const { openPane } = useInfoPaneActions();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [highlightedSearchResult, setHighlightedSearchResult] = useState<
    string | null
  >(null);
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

      if (name.includes(query)) {
        const { id } = feature.properties;
        potentialPlaces.push(id);
      }
    }

    setSearchResults(potentialPlaces);
    setHighlightedSearchResult(
      potentialPlaces.length > 0 ? potentialPlaces[0] : null,
    );
  }

  return (
    <>
      <Map placesGeoJSON={placesGeoJSON} />

      <div className="absolute top-4 left-4 w-full max-w-90 z-20">
        <InputGroup className="p-1 py-5 bg-background">
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
            <Search className="h-4 w-4" />
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
    </>
  );
}
