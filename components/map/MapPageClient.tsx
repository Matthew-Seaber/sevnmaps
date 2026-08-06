"use client";

import { useEffect, useRef } from "react";

import { useInfoPane } from "@/components/map/InfoPaneContext";

type MapPageProps = {
  type?: string;
  id?: string;
};

export default function MapPageClient({ type, id }: MapPageProps) {
  const { openPane } = useInfoPane();
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

  return null;
}
