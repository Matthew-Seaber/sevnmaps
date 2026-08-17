"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { useInfoPaneState } from "./InfoPaneContext";
import { useMobileSidebar } from "./MobileSidebarContext";

import TextLogo from "@/components/navbar/TextLogoLink";
import SidebarButtons from "@/components/map/SidebarButtons";
import ListsComponent from "@/components/map/ListsComponent";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Separator } from "../ui/separator";

interface SidebarList {
  id: string;
  listName: string;
  listColor: string;
  placeCount: number;
}

function SidebarMobileClient({
  listsKey,
  sidebarLists,
  profileSection,
}: {
  listsKey: string;
  sidebarLists: SidebarList[];
  profileSection: ReactNode;
}) {
  const infoPaneState = useInfoPaneState();
  const { mobileSidebarState, openPane, closePane } = useMobileSidebar();

  const paneOpen = infoPaneState.type !== "closed";

  useEffect(() => {
    if (paneOpen && mobileSidebarState.type === "open") {
      closePane();
    }
  }, [paneOpen, mobileSidebarState.type, closePane]);

  if (paneOpen) {
    return null;
  }

  return (
    <Sheet
      open={mobileSidebarState.type === "open"}
      onOpenChange={(isOpen) => {
        if (isOpen) {
          openPane();
        } else {
          closePane();
        }
      }}
    >
      <SheetContent side="left" showCloseButton={false}>
        <div className="flex h-full flex-col justify-between p-6">
          <div>
            <TextLogo link="/map" />

            <SidebarButtons discoverButtons={false} />

            <ListsComponent key={listsKey} sidebarLists={sidebarLists} />
          </div>

          <div className="flex w-full flex-col items-center justify-center gap-6">
            <Separator />
            
            {profileSection}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default SidebarMobileClient;
