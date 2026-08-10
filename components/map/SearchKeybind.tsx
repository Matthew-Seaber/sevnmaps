"use client";

import { useEffect } from "react";

export function SearchOpenKeybind() {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const activeElement = document.activeElement as HTMLElement;

      if (
        activeElement.tagName === "INPUT" ||
        activeElement.isContentEditable
      ) {
        return;
      }

      if (event.key === "/" && activeElement?.tagName !== "INPUT") {
        event.preventDefault();

        const searchInput = document.getElementById(
          "search-input",
        ) as HTMLInputElement | null;

        searchInput?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null;
}
