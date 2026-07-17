"use client";

import { useState } from "react";

export type InfoPaneState =
  | { type: "closed" }
  | { type: "lists" }
  | { type: "singular_list"; listID: string }
  | { type: "place"; placeID: string }
  | { type: "favorites" }
  | { type: "visited" };

interface InfoPaneContextType {
  infoPaneState: InfoPaneState;
  openPane: (paneType: Exclude<InfoPaneState, { type: "closed" }>) => void;
  closePane: () => void;
}

export function InfoPaneProvider({ children }: { children: React.ReactNode }) {
  const [infoPaneState, setInfoPaneState] = useState<InfoPaneState>({
    type: "closed",
  });

  function openPane(paneType: Exclude<InfoPaneState, { type: "closed" }>) {
    setInfoPaneState(paneType);
  }

  function closePane() {
    setInfoPaneState({ type: "closed" });
  }
}
