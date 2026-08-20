import { useState } from "react";

import { listIcons } from "@/components/map/ListIcons";

import {
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Ban } from "lucide-react";

type CreateListDialogContentProps = {
  setDialogOpen: (open: boolean) => void;
};

type ListSidebarEventDetail = {
  action: "deleted" | "updated" | "added";
  listID: string;
  newListName?: string;
  newListColor?: string;
};

const LIST_SIDEBAR_EVENT = "sevnmaps:list-sidebar-updated";

function notifySidebarListCreated(
  listID: string,
  newListName?: string,
  newListColor?: string,
) {
  window.dispatchEvent(
    new CustomEvent<ListSidebarEventDetail>(LIST_SIDEBAR_EVENT, {
      detail: { action: "added", listID, newListName, newListColor },
    }),
  );
}

export default function CreateListDialogContent({
  setDialogOpen,
}: CreateListDialogContentProps) {
  const [listName, setListName] = useState<string>("");
  const [listColor, setListColor] = useState<string>("#1273F6");
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  async function handleCreateList() {
    if (listName.trim() === "") {
      toast.info("Please enter a list name.");
      return;
    }

    try {
      const response = await fetch("/api/lists/create_list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listName: listName,
          listColor: listColor.slice(1) || "1273F6",
          listIcon: selectedIcon,
        }),
      });

      if (!response.ok) {
        console.error("Failed to create list:", response.statusText);

        if (response.status === 403) {
          toast.info(
            "You have reached the maximum number of lists allowed for your subscription plan.",
          );
        } else {
          toast.error("Failed to create list. Please try again later.");
        }

        return;
      }

      setDialogOpen(false);

      const data = await response.json();
      const listID = data.id;

      window.setTimeout(() => {
        notifySidebarListCreated(listID, listName, listColor.slice(1));
      }, 0);

      setListName("");
      setListColor("#1273F6");
      setSelectedIcon(null);
      toast.success("List created!");
    } catch (error) {
      console.error("Failed to create list:", error);
      toast.error("Failed to create list. Please try again later.");
    }
  }

  return (
    <>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create list</DialogTitle>
          <DialogDescription>
            Start a new list to save your favourite spots.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <Label htmlFor="listName">List name</Label>
            <Input
              id="listName"
              type="text"
              placeholder="Name"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
            />
          </Field>
          <Field>
            <Label htmlFor="listColor">List colour</Label>
            <Input
              id="listColor"
              type="color"
              defaultValue="#1273F6"
              className="w-8! h-8! p-0"
              value={listColor}
              onChange={(e) => setListColor(e.target.value)}
            />
          </Field>
          <Field>
            <Label>List icon</Label>
            <div className="grid grid-cols-8 rounded-lg border border-border p-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-md ${selectedIcon === null ? "bg-primary/50 hover:bg-primary/30" : "hover:bg-primary/20"}`}
                onClick={() => setSelectedIcon(null)}
              >
                <Ban className="w-5 h-5" />
              </div>

              {listIcons.map(({ id, icon: Icon }) => (
                <div
                  key={id}
                  className={`flex h-10 w-10 items-center justify-center rounded-md ${selectedIcon === id ? "bg-primary/50 hover:bg-primary/30" : "hover:bg-primary/20"}`}
                  onClick={() => setSelectedIcon(id)}
                >
                  <Icon className="w-5 h-5" style={{ color: `${listColor}` }} />
                </div>
              ))}
            </div>
          </Field>
        </FieldGroup>

        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
          <Button type="submit" className="md:ml-2" onClick={handleCreateList}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>

      <Toaster position="top-center" />
    </>
  );
}
