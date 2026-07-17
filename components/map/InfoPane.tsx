"use client";

import { useInfoPane } from "./InfoPaneContext";
import InfoPaneContent from "./InfoPaneContent";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { X } from "lucide-react";

function MapPageInfoPane() {
  const { infoPaneState, closePane } = useInfoPane();

  if (infoPaneState.type === "closed") {
    return null;
  }

  return (
    <>
      <div className="flex md:hidden">
        <Drawer>
          <DrawerContent>
            <InfoPaneContent infoPaneState={infoPaneState} />
          </DrawerContent>
        </Drawer>
      </div>

      <div className="relative hidden md:flex flex-col w-100 border-l-2 border-border p-6 shadow-xl">
        <Button
          variant="outline"
          className="absolute top-8 right-8 z-2 rounded-full w-12 h-12 shadow-md"
          onClick={closePane}
        >
          <X className="w-5! h-5!" />
        </Button>

        <div className="flex-1">
          <InfoPaneContent infoPaneState={infoPaneState} />
        </div>
      </div>
    </>
  );
}

export default MapPageInfoPane;
