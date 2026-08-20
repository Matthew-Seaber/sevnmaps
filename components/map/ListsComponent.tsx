"use client";

import { useEffect, useState } from "react";

import { useInfoPane } from "./InfoPaneContext";

import CreateListDialogContent from "./CreateListDialogContent";

import { Dialog, DialogTrigger } from "@/components/ui/dialog";

interface SidebarList {
  id: string;
  listName: string;
  listColor: string;
  placeCount: number;
}

type ListSidebarEventDetail = {
  action: "deleted" | "updated" | "added";
  listID: string;
  newListName?: string;
  newListColor?: string;
  newPlaceCountChange?: number;
};

const LIST_SIDEBAR_EVENT = "sevnmaps:list-sidebar-updated";

function ListsComponent({ sidebarLists }: { sidebarLists: SidebarList[] }) {
  const [lists, setLists] = useState<SidebarList[]>(sidebarLists);
  const displayedLists = lists.slice(0, 5);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const { openPane } = useInfoPane();

  useEffect(() => {
    function handleSidebarUpdate(event: Event) {
      const customEvent = event as CustomEvent<ListSidebarEventDetail>;

      if (
        customEvent.detail.action !== "deleted" &&
        customEvent.detail.action !== "updated" &&
        customEvent.detail.action !== "added"
      ) {
        return;
      }

      if (customEvent.detail.action === "updated") {
        const updatedName = customEvent.detail.newListName;
        const updatedColor = customEvent.detail.newListColor;
        const placeCountChange = customEvent.detail.newPlaceCountChange;

        setLists((currentLists) => {
          const updatedLists = currentLists.map((list) => {
            if (list.id === customEvent.detail.listID) {
              return {
                ...list,
                listName: updatedName || list.listName,
                listColor: updatedColor || list.listColor,
                placeCount: list.placeCount + (placeCountChange || 0),
              };
            }

            return list;
          });

          return updatedLists;
        });
      } else if (customEvent.detail.action === "deleted") {
        setLists((currentLists) =>
          currentLists.filter((list) => list.id !== customEvent.detail.listID),
        );
      } else if (customEvent.detail.action === "added") {
        const newList = {
          id: customEvent.detail.listID,
          listName: customEvent.detail.newListName,
          listColor: customEvent.detail.newListColor,
          placeCount: 0,
        } as SidebarList;

        setLists((currentLists) => [newList, ...currentLists]);
      }
    }

    window.addEventListener(LIST_SIDEBAR_EVENT, handleSidebarUpdate);

    return () => {
      window.removeEventListener(LIST_SIDEBAR_EVENT, handleSidebarUpdate);
    };
  });

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

            <CreateListDialogContent setDialogOpen={setDialogOpen} />
          </Dialog>
        </div>
        {lists.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center">
            No lists found
          </p>
        ) : (
          <div className="flex flex-col gap-0.5 px-1">
            {displayedLists.map((list) => (
              <div
                key={list.id}
                className="group flex flex-row justify-between items-center hover:text-primary hover:bg-primary/10 cursor-default rounded-lg px-3 py-1"
                onClick={() =>
                  openPane({ type: "singular_list", listID: list.id })
                }
              >
                <div className="flex flex-row items-center gap-3">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: `#${list.listColor}` }}
                  />
                  <p className="font-semibold text-sm">{list.listName}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground tabular-nums group-hover:text-primary">
                    {list.placeCount}
                  </p>
                </div>
              </div>
            ))}

            {lists.length > 5 && (
              <p
                onClick={() => openPane({ type: "lists" })}
                className="mt-2 text-sm text-center text-muted-foreground hover:underline cursor-pointer"
              >
                See more
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default ListsComponent;
