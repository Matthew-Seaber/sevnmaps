"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

function ListsPane() {
  const [section, setSection] = useState<"all" | "owned" | "shared">("all");
  const [loading, setLoading] = useState<boolean>(true);

  return (
    <div className="flex flex-col gap-6 mt-4">
      <h1 className="text-2xl font-semibold mb-2">Your lists</h1>

      <div className="flex flex-row items-center gap-1.5">
        <Badge
          variant={`${section === "all" ? "default" : "outline"}`}
          className="p-3 cursor-pointer"
          onClick={() => setSection("all")}
        >
          All lists
        </Badge>
        <Badge
          variant={`${section === "owned" ? "default" : "outline"}`}
          className="p-3 cursor-pointer"
          onClick={() => setSection("owned")}
        >
          Created by me
        </Badge>
        <Badge
          variant={`${section === "shared" ? "default" : "outline"}`}
          className="p-3 cursor-pointer"
          onClick={() => setSection("shared")}
        >
          Shared with me
        </Badge>
      </div>

      {loading ? (
        <div className="flex flex-row items-center gap-2">
          <Spinner />
          <p className="text-sm">Loading...</p>
        </div>
      ) : (
        <p>content</p>
      )}
    </div>
  );
}

export default ListsPane;
