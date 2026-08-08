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

type InfoPaneActions = Pick<InfoPaneContextType, "openPane" | "closePane">;

const InfoPaneStateContext = createContext<InfoPaneState | undefined>(
  undefined,
);
const InfoPaneActionsContext = createContext<InfoPaneActions | undefined>(
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

  return (
    <InfoPaneActionsContext.Provider
      value={useMemo(() => ({ openPane, closePane }), [openPane, closePane])}
    >
      <InfoPaneStateContext.Provider value={infoPaneState}>
        {children}
      </InfoPaneStateContext.Provider>
    </InfoPaneActionsContext.Provider>
  );
}

export function useInfoPaneState() {
  const context = useContext(InfoPaneStateContext);

  if (!context) {
    throw new Error("useInfoPaneState must be within an InfoPaneProvider");
  }

  return context;
}

export function useInfoPaneActions() {
  const context = useContext(InfoPaneActionsContext);

  if (!context) {
    throw new Error("useInfoPaneActions must be within an InfoPaneProvider");
  }

  return context;
}

export function useInfoPane() {
  const infoPaneState = useInfoPaneState();
  const { openPane, closePane } = useInfoPaneActions();

  return { infoPaneState, openPane, closePane };
}
