"use client";

import { useState } from "react";

import CreateListDialogContent from ".././CreateListDialogContent";

import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

function ListsPane() {
  const [section, setSection] = useState<"all" | "owned" | "shared">("all");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
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
