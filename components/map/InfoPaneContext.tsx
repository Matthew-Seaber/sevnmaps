"use client";

import { createContext, useContext, useState } from "react";

export type InfoPaneState =
  | { type: "closed" }
  | { type: "lists" }
  | { type: "singular_list"; listID: string, listName: string }
  | { type: "place"; placeID: string }
  | { type: "favorites" }
  | { type: "visited" };

interface InfoPaneContextType {
  infoPaneState: InfoPaneState;
  openPane: (paneType: Exclude<InfoPaneState, { type: "closed" }>) => void;
  closePane: () => void;
}

const InfoPaneContext = createContext<InfoPaneContextType | undefined>(
  undefined,
);

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

  return (
    <InfoPaneContext.Provider value={{ infoPaneState, openPane, closePane }}>
      {children}
    </InfoPaneContext.Provider>
  );
}

export function useInfoPane() {
  const context = useContext(InfoPaneContext);

  if (!context) {
    throw new Error("useInfoPane must be within an InfoPaneProvider");
  }

  return context;
}
