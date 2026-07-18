"use client";

import { useEffect } from "react";

import { useInfoPane } from "./InfoPaneContext";

function InfoPaneCloseKeybind() {
  const { closePane } = useInfoPane();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const activeElement = document.activeElement as HTMLElement;

      if (
        activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.isContentEditable
      ) {
        return;
      }

      if (
        event.key === "Escape" &&
        document.activeElement?.tagName !== "INPUT"
      ) {
        event.preventDefault();

        closePane();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closePane]);

  return null;
}

export default InfoPaneCloseKeybind;
