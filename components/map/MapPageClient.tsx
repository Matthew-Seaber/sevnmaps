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

  return (
    <>
      <Map placesGeoJSON={placesGeoJSON} />

      <div className="absolute top-4 left-4 w-full max-w-90 z-20">
        <InputGroup className="p-1 py-5 bg-background">
          <InputGroupInput
            id="search-input"
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <InputGroupAddon>
            <Search className="h-4 w-4" />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end" className="hidden lg:flex">
            <Kbd>/</Kbd>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </>
  );
}
