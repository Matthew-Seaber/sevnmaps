"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

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

const InfoPaneContext = createContext<InfoPaneContextType | undefined>(
  undefined,
);

export function InfoPaneProvider({ children }: { children: React.ReactNode }) {
  const [infoPaneState, setInfoPaneState] = useState<InfoPaneState>({
    type: "closed",
  });

  const openPane = useCallback(
    (paneType: Exclude<InfoPaneState, { type: "closed" }>) => {
      setInfoPaneState((current) => {
        if (JSON.stringify(current) === JSON.stringify(paneType)) {
          return current;
        }

        return paneType;
      });
    },
    [],
  );

  const closePane = useCallback(() => {
    setInfoPaneState({ type: "closed" });
  }, []);

  const value = useMemo(
    () => ({ infoPaneState, openPane, closePane }),
    [infoPaneState, openPane, closePane],
  );

  return (
    <InfoPaneContext.Provider value={value}>
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
