import type { ReactNode } from "react";
import SidebarMobileClient from "@/components/map/SidebarMobileClient";

import MapPageProfileSection from "@/components/navbar/ProfileSectionServer";

interface Place {
  id: string;
  placeName: string;
  address: string;
  longitude: number;
  latitude: number;
  favorite: boolean;
  visited: boolean;
  inList: boolean;
  listColor?: string | null;
  createdAt: Date;
}

interface SidebarList {
  id: string;
  listName: string;
  listColor: string;
  placeCount: number;
}

function MapPageSheet({
  placeData,
  listsKey,
  sidebarLists,
}: {
  placeData: Place[];
  listsKey: string;
  sidebarLists: SidebarList[];
}) {
  const profileSection: ReactNode = (
    <MapPageProfileSection nameVisible="true" />
  );

  return (
    <SidebarMobileClient
      placeData={placeData}
      listsKey={listsKey}
      sidebarLists={sidebarLists}
      profileSection={profileSection}
    />
  );
}

export default MapPageSheet;
