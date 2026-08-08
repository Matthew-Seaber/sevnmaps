"use client";

import { memo, useEffect, useRef } from "react";

import * as mapboxgl from "mapbox-gl/esm";
import "mapbox-gl/dist/mapbox-gl.css";

import { useInfoPaneActions } from "./InfoPaneContext";

type MapProps = {
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
      };

      geometry: {
        type: "Point";
        coordinates: [number, number];
      };
    }[];
  };
};

function Map({ placesGeoJSON }: MapProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const { openPane } = useInfoPaneActions();

  useEffect(() => {
    if (!mapContainerRef.current || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN)
      return;

    const container = mapContainerRef.current;

    const createMap = (
      longitude: number,
      latitude: number,
      geolocateControl: boolean,
    ) => {
      const map = new mapboxgl.Map({
        accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
        container,
        center: [longitude, latitude],
        zoom: 12,
        projection: "globe",
        dragRotate: false,
      });

      mapRef.current = map;

      map.addControl(
        new mapboxgl.NavigationControl({
          showCompass: false,
        }),
        "top-right",
      );

      if (geolocateControl) {
        map.addControl(
          new mapboxgl.GeolocateControl({
            positionOptions: {
              enableHighAccuracy: true,
            },
            trackUserLocation: true,
            showUserHeading: true,
          }),
          "top-right",
        );
      }

      map.on("load", () => {
        map.addSource("places", {
          type: "geojson",
          data: placesGeoJSON,

          cluster: true,
          clusterMaxZoom: 10,
          clusterRadius: 50,
        });

        map.addLayer({
          id: "clusters",
          type: "circle",
          source: "places",
          filter: ["has", "point_count"],
          paint: {
            "circle-radius": 20,
            "circle-color": "#FF7A00",
            "circle-opacity": 0.8,
          },
        });

        map.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "places",
          filter: ["has", "point_count"],
          layout: {
            "text-field": ["get", "point_count_abbreviated"],
            "text-size": 12,
          },
        });

        map.addLayer({
          id: "places",
          type: "circle",
          source: "places",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-radius": 8,
            "circle-color": "#3B82F6",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#FFFFFF",
          },
        });

        map.on("click", "places", (e) => {
          const feature = e.features?.[0];

          if (!feature || !feature.properties) return;

          const placeId = feature.properties.id;

          if (!placeId) return;

          openPane({ type: "place", placeID: placeId });
        });

        map.on("mouseenter", "places", () => {
          map.getCanvas().style.cursor = "pointer";
        });

        map.on("mouseleave", "places", () => {
          map.getCanvas().style.cursor = "";
        });
      });
    };

    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        const { longitude, latitude } = position.coords;

        createMap(longitude, latitude, true);
      },
      (error: GeolocationPositionError) => {
        console.log("Error getting user's location:", error);

        createMap(-0.115, 51.5, false);
      },
    );

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [placesGeoJSON, openPane]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
}

export default memo(Map);
