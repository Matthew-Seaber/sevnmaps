"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type MobileSidebarState = { type: "closed" } | { type: "open" };

interface MobileSidebarContextType {
  mobileSidebarState: MobileSidebarState;
  openPane: () => void;
  closePane: () => void;
}

type MobileSidebarActions = Pick<
  MobileSidebarContextType,
  "openPane" | "closePane"
>;

const MobileSidebarStateContext = createContext<MobileSidebarState | undefined>(
  undefined,
);
const MobileSidebarActionsContext = createContext<
  MobileSidebarActions | undefined
>(undefined);

export function MobileSidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarState, setMobileSidebarState] =
    useState<MobileSidebarState>({
      type: "closed",
    });

  const openPane = useCallback(() => {
    setMobileSidebarState({ type: "open" });
  }, []);

  const closePane = useCallback(() => {
    setMobileSidebarState({ type: "closed" });
  }, []);

  return (
    <MobileSidebarActionsContext.Provider
      value={useMemo(() => ({ openPane, closePane }), [openPane, closePane])}
    >
      <MobileSidebarStateContext.Provider value={mobileSidebarState}>
        {children}
      </MobileSidebarStateContext.Provider>
    </MobileSidebarActionsContext.Provider>
  );
}

export function useMobileSidebarState() {
  const context = useContext(MobileSidebarStateContext);

  if (!context) {
    throw new Error(
      "useMobileSidebarState must be within a MobileSidebarProvider",
    );
  }

  return context;
}

export function useMobileSidebarActions() {
  const context = useContext(MobileSidebarActionsContext);

  if (!context) {
    throw new Error(
      "useMobileSidebarActions must be within a MobileSidebarProvider",
    );
  }

  return context;
}

export function useMobileSidebar() {
  const mobileSidebarState = useMobileSidebarState();
  const { openPane, closePane } = useMobileSidebarActions();

  return { mobileSidebarState, openPane, closePane };
}
