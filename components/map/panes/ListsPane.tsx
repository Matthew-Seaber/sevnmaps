"use client";

import { useCallback, useEffect, useState } from "react";

import CreateListDialogContent from ".././CreateListDialogContent";

import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface List {
  id: string;
  name: string;
  color: string;
  visibility?: "Public" | "Private" | "Shared" | "Paid access";
  role?: "Creator" | "Admin" | "Editor" | "Viewer";
  creatorName?: string;
  placeCount: number;
}

function ListsPane() {
  const [section, setSection] = useState<"all" | "owned" | "shared">("all");
  const [createdLists, setCreatedLists] = useState<List[]>([]);
  const [sharedLists, setSharedLists] = useState<List[]>([]);
  const [recommendedLists, setRecommendedLists] = useState<List[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchListsData = useCallback(async () => {
    try {
      const response = await fetch("/api/lists/get_full_lists_data");

      if (!response.ok) {
        console.error("Failed to fetch lists data:", response.statusText);
        return;
      }

      const data = await response.json();
      setCreatedLists(data.createdLists);
      setSharedLists(data.sharedLists);
      setRecommendedLists(data.recommendedLists);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching lists data:", error);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await fetchListsData();
    };

    fetchData();
  }, [fetchListsData]);

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
      ) : section === "all" ? (
        <p>All lists content</p>
      ) : section === "owned" ? (
        <p>Owned lists content</p>
      ) : section === "shared" ? (
        <p>Shared lists content</p>
      ) : null}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger
          render={
            <Button className="absolute size-14 bottom-8 right-8">
              <Plus className="size-7" />
            </Button>
          }
        />

        <CreateListDialogContent setDialogOpen={setDialogOpen} />
      </Dialog>
    </div>
  );
}

export default ListsPane;
