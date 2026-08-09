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
        inList: boolean;
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

  function createIcon(iconPath: string, backgroundColor: string): string {
    return `
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="11"
        cy="11"
        r="10"
        fill="${backgroundColor}"
        stroke="white"
        stroke-width="1.5"
      />

      <path
        d="${iconPath}"
        transform="translate(5 4.8) scale(0.5)"
        fill="white"
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;
  }

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
        const svgMarkup = createIcon(
          "M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5",
          "#FB2C36",
        );

        if (!svgMarkup) {
          console.error("Failed to create SVG markup");
          return;
        }

        const iconBlob = new Blob([svgMarkup], { type: "image/svg+xml" });
        const iconURL = URL.createObjectURL(iconBlob);

        const image = new Image(20, 20);

        image.onload = () => {
          URL.revokeObjectURL(iconURL);

          if (!map.hasImage("heart-icon")) {
            map.addImage("heart-icon", image);
          }

          map.addLayer({
            // Favourite points
            id: "favorite-places",
            type: "symbol",
            source: "places",
            filter: [
              "all",
              ["!", ["has", "point_count"]],
              ["==", ["get", "favorite"], true],
              ["==", ["get", "inList"], false],
            ],
            layout: {
              "icon-image": "heart-icon",
              "icon-size": 1,
              "icon-allow-overlap": true,
            },
          });

          map.on("click", "favorite-places", (e) => {
            const feature = e.features?.[0];

            if (!feature || !feature.properties) return;

            const placeId = feature.properties.id;

            if (!placeId) return;

            openPane({ type: "place", placeID: placeId });
          });

          map.on("mouseenter", "favorite-places", () => {
            map.getCanvas().style.cursor = "pointer";
          });

          map.on("mouseleave", "favorite-places", () => {
            map.getCanvas().style.cursor = "";
          });
        };

        image.onerror = (error) => {
          console.error("Error loading place icon:", error);
        };

        image.src = iconURL;

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
          // Normal points
          id: "places",
          type: "circle",
          source: "places",
          filter: [
            "all",
            ["!", ["has", "point_count"]],
            ["==", ["get", "favorite"], false],
          ],
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
