"use client";

import InfoPaneContent from "./InfoPaneContent";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

function MapPageInfoPane() {

  return (
    <div className="hidden md:flex flex-col w-100 border-l-2 border-border p-6 shadow-xl">
      <div>
        <Button>
          <X />
        </Button>
      </div>
      <div>
        <InfoPaneContent infoPaneState={#} />
      </div>
    </div>
  );
}

export default MapPageInfoPane;
