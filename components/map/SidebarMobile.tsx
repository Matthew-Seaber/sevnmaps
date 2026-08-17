import type { ReactNode } from "react";
import SidebarMobileClient from "@/components/map/SidebarMobileClient";

import MapPageProfileSection from "@/components/navbar/ProfileSectionServer";

interface SidebarList {
  id: string;
  listName: string;
  listColor: string;
  placeCount: number;
}

function MapPageSheet({
  listsKey,
  sidebarLists,
}: {
  listsKey: string;
  sidebarLists: SidebarList[];
}) {
  const profileSection: ReactNode = (
    <MapPageProfileSection nameVisible="true" />
  );

  return (
    <SidebarMobileClient
      listsKey={listsKey}
      sidebarLists={sidebarLists}
      profileSection={profileSection}
    />
  );
}

export default MapPageSheet;
