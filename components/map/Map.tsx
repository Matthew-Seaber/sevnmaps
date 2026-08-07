"use client";

import { useEffect, useRef } from "react";
import * as mapboxgl from "mapbox-gl/esm";
import "mapbox-gl/dist/mapbox-gl.css";

export default function Map() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN)
      return;

    const container = mapContainerRef.current;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        mapRef.current = new mapboxgl.Map({
          accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
          container,
          center: [longitude, latitude],
          zoom: 12,
          projection: "globe",
          dragRotate: false,
        });

        mapRef.current.addControl(
          new mapboxgl.NavigationControl({
            showCompass: false,
          }),
          "top-right",
        );

        mapRef.current.addControl(
          new mapboxgl.GeolocateControl({
            positionOptions: {
              enableHighAccuracy: true,
            },
            trackUserLocation: true,
            showUserHeading: true,
          }),
          "top-right",
        );
      },
      (error) => {
        console.log("Error getting user's location:", error);

        mapRef.current = new mapboxgl.Map({
          accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
          container,
          center: [-0.115, 51.5],
          zoom: 12,
          projection: "globe",
          dragRotate: false,
        });

        mapRef.current.addControl(
          new mapboxgl.NavigationControl({
            showCompass: false,
          }),
          "top-right",
        );
      },
    );

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  return (
    <>
      <div id="map-container" ref={mapContainerRef} className="w-full h-full" />
    </>
  );
}
