"use client";

import { useEffect, useState } from "react";

import { useInfoPane } from "./InfoPaneContext";
import InfoPaneContent from "./InfoPaneContent";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { X } from "lucide-react";

function MapPageInfoPane() {
  const { infoPaneState, closePane } = useInfoPane();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsDesktop(event.matches);
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  if (infoPaneState.type === "closed") {
    return null;
  }

  if (isDesktop) {
    return (
      <div className="relative hidden md:flex flex-col w-136 border-l-2 border-border p-6 shadow-2xl overflow-y-auto">
        <Button
          variant="outline"
          className="absolute top-8 right-8 z-2 rounded-full w-12 h-12 shadow-md opacity-90"
          onClick={closePane}
        >
          <X className="w-5! h-5!" />
        </Button>

        <div className="flex-1">
          <InfoPaneContent infoPaneState={infoPaneState} />
        </div>
      </div>
    );
  }

  if (!isDesktop) {
    return (
      <Drawer
        open
        onOpenChange={(open) => {
          if (!open) {
            closePane();
          }
        }}
        swipeDirection="down"
        modal
      >
        <DrawerContent className="p-6 overflow-y-auto overscroll-contain">
          <Button
            variant="outline"
            className="absolute top-8 right-8 z-20 rounded-full w-12 h-12 shadow-md opacity-90"
            onClick={closePane}
          >
            <X className="w-5! h-5!" />
          </Button>

          <InfoPaneContent infoPaneState={infoPaneState} />
        </DrawerContent>
      </Drawer>
    );
  }
}

export default MapPageInfoPane;
