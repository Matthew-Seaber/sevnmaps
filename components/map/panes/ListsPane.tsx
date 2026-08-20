"use client";

import { useCallback, useEffect, useState } from "react";

import { useInfoPane } from ".././InfoPaneContext";

import CreateListDialogContent from ".././CreateListDialogContent";
import ConfirmationPopup from "@/components/utility/ConfirmationPopup";
import { listIcons } from "@/components/map/ListIcons";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  Plus,
  Ellipsis,
  Trash2,
  CircleDollarSign,
  Network,
  Globe,
  Lock,
  Search,
} from "lucide-react";

interface List {
  id: string;
  name: string;
  color: string;
  icon?: string;
  visibility?: "Public" | "Private" | "Shared" | "Paid access";
  role?: "Creator" | "Admin" | "Editor" | "Viewer";
  creatorName?: string;
  placeCount: number;
  memberCount: number;
}

type ListSidebarEventDetail = {
  action: "deleted" | "updated" | "added";
  listID: string;
  newListName?: string;
  newListColor?: string;
  newPlaceCountChange?: number;
};

const LIST_SIDEBAR_EVENT = "sevnmaps:list-sidebar-updated";

function notifySidebarListDeleted(listID: string) {
  window.dispatchEvent(
    new CustomEvent<ListSidebarEventDetail>(LIST_SIDEBAR_EVENT, {
      detail: { action: "deleted", listID },
    }),
  );
}

function ListsPane() {
  const [section, setSection] = useState<"all" | "owned" | "shared">("all");
  const [createdLists, setCreatedLists] = useState<List[]>([]);
  const [sharedLists, setSharedLists] = useState<List[]>([]);
  const [recommendedLists, setRecommendedLists] = useState<List[]>([]);
  const [ownedSearchQuery, setOwnedSearchQuery] = useState<string>("");
  const [sharedSearchQuery, setSharedSearchQuery] = useState<string>("");
  const [focusedListID, setFocusedListID] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [deletePopupOpen, setDeletePopupOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const { openPane } = useInfoPane();

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

  async function handleDeleteList() {
    if (!focusedListID) {
      toast.error(
        "Error deleting list. If this error persists, try opening the list and deleting it from under the ellipsis menu.",
      );
      return;
    }

    try {
      const response = await fetch(`/api/lists/delete_list`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listID: focusedListID }),
      });

      if (!response.ok) {
        console.error("Error deleting list:", response.statusText);
        toast.error("Failed to delete list. Please try again later.");
        return;
      }

      openPane({ type: "lists" });
      toast.success("List deleted.");

      setCreatedLists((prevLists) =>
        prevLists.filter((list) => list.id !== focusedListID),
      );
      notifySidebarListDeleted(focusedListID);

      setFocusedListID(null);
    } catch (error) {
      console.error("Error deleting list:", error);
      toast.error("Failed to delete list. Please try again later.");
    }
  }

  const filteredOwnedLists = createdLists.filter((list) => {
    const query = ownedSearchQuery.toLowerCase();

    return list.name.toLowerCase().includes(query);
  });

  return (
    <>
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
          <>
            <div className="flex flex-row justify-between items-center">
              <p className="font-bold text-sm">
                {createdLists.length} list{createdLists.length !== 1 ? "s" : ""}
              </p>

              <InputGroup className="p-1 py-4 max-w-48">
                <InputGroupInput
                  id="search-input"
                  placeholder="Search your lists..."
                  value={ownedSearchQuery}
                  onChange={(e) => setOwnedSearchQuery(e.target.value)}
                />
                <InputGroupAddon>
                  <Search className="h-4 w-4" />
                </InputGroupAddon>
              </InputGroup>
            </div>
            {createdLists.length === 0 ? (
              <p className="mt-2 text-center text-sm text-muted-foreground">
                You haven&apos;t created any lists yet. Create your first list
                to see it here!
              </p>
            ) : (
              <div className="grid grid-cols gap-4">
                {filteredOwnedLists.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 mt-2">
                    <p className="text-sm">
                      No lists found that match your search query.
                    </p>
                    <Button
                      size="lg"
                      className="p-4"
                      onClick={() => setOwnedSearchQuery("")}
                    >
                      Clear search
                    </Button>
                  </div>
                ) : (
                  filteredOwnedLists.map((list) => {
                    const ListIconComponent = listIcons.find(
                      (icon) => icon.id === list.icon,
                    )?.icon;

                    return (
                      <div
                        key={list.id}
                        className="flex flex-row items-center justify-between p-4 border border-border rounded-md shadow-sm hover:scale-103 transition-transform duration-200 cursor-pointer"
                        onClick={() =>
                          openPane({ type: "singular_list", listID: list.id })
                        }
                      >
                        <div className="flex flex-row items-center gap-4">
                          {ListIconComponent ? (
                            <ListIconComponent
                              className="h-20 w-20 text-accent rounded-md p-4"
                              strokeWidth={1.5}
                              style={{ backgroundColor: `#${list.color}` }}
                            />
                          ) : (
                            <span
                              className={`inline-block w-20 h-20 rounded-md`}
                              style={{ backgroundColor: `#${list.color}` }}
                            />
                          )}
                          <div className="flex flex-col gap-1">
                            <h2 className="font-bold text-lg">{list.name}</h2>

                            <div className="flex flex-row items-center gap-2 font-semibold text-sm text-muted-foreground">
                              <p>
                                {list.placeCount} place
                                {list.placeCount !== 1 ? "s" : ""}
                              </p>
                              {list.memberCount > 0 && (
                                <p>
                                  {list.memberCount} member
                                  {list.memberCount !== 1 ? "s" : ""}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row items-center gap-2 bg-accent rounded-md py-2 px-2 md:px-4 font-semibold text-sm text-muted-foreground">
                          {list.visibility === "Public" ? (
                            <Globe strokeWidth={2.25} className="size-3.5" />
                          ) : list.visibility === "Private" ? (
                            <Lock strokeWidth={2.25} className="size-3.5" />
                          ) : list.visibility === "Shared" ? (
                            <Network strokeWidth={2.25} className="size-3.5" />
                          ) : list.visibility === "Paid access" ? (
                            <CircleDollarSign
                              strokeWidth={2.25}
                              className="size-3.5"
                            />
                          ) : null}
                          <p>{list.visibility}</p>
                        </div>

                        <div>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  variant="outline"
                                  onClick={(e) => e.stopPropagation()}
                                  className="h-10 w-10"
                                />
                              }
                            >
                              <Ellipsis className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-40">
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation();

                                  setDeletePopupOpen(true);
                                  setFocusedListID(list.id);
                                }}
                              >
                                <Trash2 /> Delete list
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>
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

      <Toaster position="top-center" />

      <ConfirmationPopup
        open={deletePopupOpen}
        setOpen={setDeletePopupOpen}
        title="Delete list"
        message={`Are you sure you want to delete your list '${createdLists.find((lst) => lst.id === focusedListID)?.name}'?`}
        destructive={true}
        confirmText="Delete list"
        cancelText="Cancel"
        onConfirm={handleDeleteList}
      />
    </>
  );
}

export default ListsPane;
