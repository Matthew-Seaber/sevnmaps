"use client";

import { useState } from "react";

import { useInfoPane } from "./InfoPaneContext";

import { listIcons } from "@/components/map/ListIcons";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Ban } from "lucide-react";

interface SidebarList {
  id: string;
  listName: string;
  listColor: string;
  placeCount: number;
}

function ListsComponent({ sidebarLists }: { sidebarLists: SidebarList[] }) {
  const [lists, setLists] = useState<SidebarList[]>(sidebarLists);
  const [displayedLists, setDisplayedLists] = useState<SidebarList[]>(
    sidebarLists.slice(0, 5),
  );
  const [listName, setListName] = useState<string>("");
  const [listColor, setListColor] = useState<string>("#1273F6");
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const { openPane } = useInfoPane();

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
        toast.error("Failed to create list. Please try again later.");
        return;
      }

      const data = await response.json();
      const newList: SidebarList = {
        id: data.id,
        listName: data.listName,
        listColor: data.listColor,
        placeCount: 0,
      };
      setDialogOpen(false);
      setLists([newList, ...lists]);
      setDisplayedLists([newList, ...displayedLists.slice(0, 4)]);
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
      <div className="flex flex-col gap-0.5 mt-6">
        <div className="flex items-center gap-3 pb-2">
          <h3
            className="text-sm font-medium pl-3 cursor-default"
            onClick={() => openPane({ type: "lists" })}
          >
            YOUR LISTS
          </h3>
          <div className="h-px flex-1 bg-border" />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger>
              <p className="h-8 w-8 rounded-xl font-semibold text-xl text-muted-foreground hover:text-primary hover:bg-primary/10">
                +
              </p>
            </DialogTrigger>
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
                        <Icon
                          className={`w-5 h-5`}
                          style={{ color: `${listColor}` }}
                        />
                      </div>
                    ))}
                  </div>
                </Field>
              </FieldGroup>

              <DialogFooter>
                <DialogClose>Cancel</DialogClose>
                <Button
                  type="submit"
                  className="md:ml-2"
                  onClick={handleCreateList}
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {lists.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center">
            No lists found
          </p>
        ) : (
          <div className="flex flex-col gap-0.5 px-1">
            {displayedLists.map((list) => {
              return (
                <div
                  key={list.id}
                  className="flex flex-row justify-between items-center hover:bg-primary/10 cursor-default rounded-lg px-3 py-1"
                  onClick={() =>
                    openPane({ type: "singular_list", listID: list.id })
                  }
                >
                  <div className="flex flex-row items-center gap-3">
                    <span
                      className={`inline-block w-2 h-2 rounded-full`}
                      style={{ backgroundColor: `#${list.listColor}` }}
                    />
                    <p className="font-semibold text-sm">{list.listName}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground tabular-nums">
                      {list.placeCount}
                    </p>
                  </div>
                </div>
              );
            })}

            {lists.length > 5 && (
              <p className="mt-2 text-sm text-center text-muted-foreground hover:underline cursor-pointer">
                See more
              </p>
            )}
          </div>
        )}
      </div>

      <Toaster position="top-center" />
    </>
  );
}

export default ListsComponent;
