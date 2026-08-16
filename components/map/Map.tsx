"use client";

import { memo, useCallback, useEffect, useRef } from "react";
import type { FeatureCollection, Point } from "geojson";

import * as mapboxgl from "mapbox-gl/esm";
import "mapbox-gl/dist/mapbox-gl.css";

import { useInfoPaneActions, useInfoPaneState } from "./InfoPaneContext";

const MAP_PLACE_UPDATED_EVENT = "map:place-updated";

type PlaceProperties = {
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

type MapPlaceUpdatedEventDetail = {
  placeId: string;
  favorite?: boolean;
  visited?: boolean;
  inList?: boolean;
};

type PlacesGeoJSON = FeatureCollection<Point, PlaceProperties>;

type MapProps = {
  placesGeoJSON: PlacesGeoJSON;
  mapType: "default" | "satellite" | "outdoors";
  immersiveMap: boolean;
  nightMap: boolean;
};

const mapStyles = {
  default: "mapbox://styles/mapbox/standard",
  satellite: "mapbox://styles/mapbox/standard-satellite",
  outdoors: "mapbox://styles/mapbox/outdoors-v12",
  outdoors_night: "mapbox://styles/matthewseaber/cmsvixs9d003g01qy3l9f9ji3",
} as const;

function Map({ placesGeoJSON, mapType, immersiveMap, nightMap }: MapProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const placesDataRef = useRef(placesGeoJSON);
  const initialMapSettingsRef = useRef({ mapType, immersiveMap, nightMap });

  const infoPaneState = useInfoPaneState();
  const { openPane } = useInfoPaneActions();

  const syncPlacesSource = useCallback(() => {
    const map = mapRef.current;

    if (!map) return;

    const source = map.getSource("places") as
      | mapboxgl.GeoJSONSource
      | undefined;

    if (!source) return;

    source.setData(placesDataRef.current);
  }, []);

  const updatePlaceInMapData = useCallback(
    (placeId: string, updates: Partial<PlaceProperties>) => {
      let hasUpdates = false;

      const newFeatures = placesDataRef.current.features.map((feature) => {
        if (feature.properties.id !== placeId) {
          return feature;
        }

        hasUpdates = true;

        return {
          ...feature,
          properties: {
            ...feature.properties,
            ...updates,
          },
        };
      });

      if (!hasUpdates) {
        return;
      }

      placesDataRef.current = {
        ...placesDataRef.current,
        features: newFeatures,
      };

      syncPlacesSource();
    },
    [syncPlacesSource],
  );

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
    placesDataRef.current = placesGeoJSON;
    syncPlacesSource();
  }, [placesGeoJSON, syncPlacesSource]);

  useEffect(() => {
    const handlePlaceUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<MapPlaceUpdatedEventDetail>;
      const { placeId, favorite, visited, inList } = customEvent.detail;

      const updates: Partial<PlaceProperties> = {};

      if (typeof favorite === "boolean") {
        updates.favorite = favorite;
      }

      if (typeof visited === "boolean") {
        updates.visited = visited;
      }

      if (typeof inList === "boolean") {
        updates.inList = inList;
      }

      if (Object.keys(updates).length === 0) {
        return;
      }

      updatePlaceInMapData(placeId, updates);
    };

    window.addEventListener(MAP_PLACE_UPDATED_EVENT, handlePlaceUpdated);

    return () => {
      window.removeEventListener(MAP_PLACE_UPDATED_EVENT, handlePlaceUpdated);
    };
  }, [updatePlaceInMapData]);

  useEffect(() => {
    if (infoPaneState.type !== "place") return;

    const map = mapRef.current;

    if (!map) return;

    const selectedPlace = placesDataRef.current.features.find(
      (feature) => feature.properties.id === infoPaneState.placeID,
    );

    if (!selectedPlace) return;

    const [longitude, latitude] = selectedPlace.geometry.coordinates;

    map.flyTo({
      center: [longitude, latitude],
      zoom: Math.max(map.getZoom(), 16),
      duration: 1000,
      essential: true,
    });
  }, [infoPaneState]);

  const addPlaceLayers = useCallback(
    (map: mapboxgl.Map) => {
      const heartSVGMarkup = createIcon(
        "M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5",
        "#FB2C36",
      );
      const listSVGMarkup = createIcon(
        "M6 3h12a2 2 0 0 1 2 2v16l-7-4-7 4V5a2 2 0 0 1 2-2z",
        "#2B7FFF",
      );

      if (!heartSVGMarkup || !listSVGMarkup) {
        console.error("Failed to create SVG markup");
        return;
      }

      const heartIconBlob = new Blob([heartSVGMarkup], {
        type: "image/svg+xml",
      });
      const listIconBlob = new Blob([listSVGMarkup], {
        type: "image/svg+xml",
      });

      const heartIconURL = URL.createObjectURL(heartIconBlob);
      const listIconURL = URL.createObjectURL(listIconBlob);

      const heartImage = new Image(20, 20);
      const listImage = new Image(20, 20);

      heartImage.onload = () => {
        URL.revokeObjectURL(heartIconURL);

        if (!map.hasImage("heart-icon")) {
          map.addImage("heart-icon", heartImage);
        }

        map.addLayer({
          // Favourite places
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

      heartImage.onerror = (error) => {
        console.error("Error loading place icon:", error);
      };

      heartImage.src = heartIconURL;

      listImage.onload = () => {
        URL.revokeObjectURL(listIconURL);

        if (!map.hasImage("list-icon")) {
          map.addImage("list-icon", listImage);
        }

        map.addLayer({
          // Places in lists
          id: "list-places",
          type: "symbol",
          source: "places",
          filter: [
            "all",
            ["!", ["has", "point_count"]],
            ["==", ["get", "inList"], true],
          ],
          layout: {
            "icon-image": "list-icon",
            "icon-size": 1,
            "icon-allow-overlap": true,
          },
        });

        map.on("click", "list-places", (e) => {
          const feature = e.features?.[0];

          if (!feature || !feature.properties) return;

          const placeId = feature.properties.id;

          if (!placeId) return;

          openPane({ type: "place", placeID: placeId });
        });

        map.on("mouseenter", "list-places", () => {
          map.getCanvas().style.cursor = "pointer";
        });

        map.on("mouseleave", "list-places", () => {
          map.getCanvas().style.cursor = "";
        });
      };

      listImage.onerror = (error) => {
        console.error("Error loading place icon:", error);
      };

      listImage.src = listIconURL;

      map.addSource("places", {
        type: "geojson",
        data: placesDataRef.current,

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
    },
    [openPane],
  );

  const addTerrain = (map: mapboxgl.Map) => {
    if (!map.getSource("mapbox-dem")) {
      map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });
    }

    map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
  };

  useEffect(() => {
    if (!mapContainerRef.current || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN)
      return;

    const container = mapContainerRef.current;

    const createMap = (
      longitude: number,
      latitude: number,
      geolocateControl: boolean,
    ) => {
      const {mapType, immersiveMap, nightMap} = initialMapSettingsRef.current;

      const map = new mapboxgl.Map({
        accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
        container,
        style:
          mapType === "outdoors"
            ? nightMap
              ? mapStyles.outdoors_night
              : mapStyles.outdoors
            : mapStyles[mapType],
        center: [longitude, latitude],
        zoom: 12,
        projection: "globe",

        dragRotate: initialMapSettingsRef.current.immersiveMap,
        touchZoomRotate: true,
        touchPitch: initialMapSettingsRef.current.immersiveMap,

        config: {
          basemap: {
            lightPreset: nightMap ? "night" : "day",
          },
        },
      });

      mapRef.current = map;

      map.addControl(
        new mapboxgl.NavigationControl({
          showCompass: immersiveMap,
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
        addTerrain(map);

        addPlaceLayers(map);
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
  }, [addPlaceLayers]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) return;

    const newStyle =
      mapType === "outdoors"
        ? nightMap
          ? mapStyles.outdoors_night
          : mapStyles.outdoors
        : mapStyles[mapType];

    map.setStyle(newStyle);

    const handleStyleLoad = () => {
      if (mapType === "default" || mapType === "satellite") {
        map.setConfigProperty(
          "basemap",
          "lightPreset",
          nightMap ? "night" : "day",
        );
      }

      addTerrain(map);
      addPlaceLayers(map);
    };

    map.once("style.load", handleStyleLoad);

    return () => {
      map.off("style.load", handleStyleLoad);
    };
  }, [mapType, nightMap, addPlaceLayers]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) return;

    if (immersiveMap) {
      map.dragRotate.enable();
      map.touchPitch.enable();

      map.easeTo({
        pitch: 60,
      });
    } else {
      map.dragRotate.disable();
      map.touchPitch.disable();

      map.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 1000,
      });
    }
  }, [immersiveMap]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
}

export default memo(Map);
