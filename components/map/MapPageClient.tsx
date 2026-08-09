"use client";

import { useEffect, useRef } from "react";

import { useInfoPaneActions } from "@/components/map/InfoPaneContext";
import Map from "./Map";

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

  return <Map placesGeoJSON={placesGeoJSON} />;
}
