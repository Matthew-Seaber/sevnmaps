"use client";

import { useEffect } from "react";

import { useInfoPane } from "@/components/map/InfoPaneContext";

type MapPageProps = {
  type?: string;
  id?: string;
};

export default function MapPageClient({ type, id }: MapPageProps) {
  const { openPane } = useInfoPane();

  useEffect(() => {
    if (type === "place" && id) {
      openPane({ type: "place", placeID: id });

      return;
    }
  }, [type, id, openPane]);

  return null;
}
