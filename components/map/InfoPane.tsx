"use client";

import { useState } from "react";

function MapPageInfoPane() {
  const [paneVisible, setPaneVisible] = useState(false);

  if (!paneVisible) return null;

  return (
    <div className="hidden md:flex flex-col w-100 border-l-2 border-border p-6 shadow-xl"></div>
  );
}

export default MapPageInfoPane;
