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
  LogOut,
  UserRoundCog,
  Pencil,
  Eye,
} from "lucide-react";

interface List {
  id: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: string;
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

  async function handleLeaveList(listID?: string) {
    if (!listID) {
      toast.error(
        "Error leaving list. If this error persists, try opening the list and leaving it from under the ellipsis menu.",
      );

      return;
    }

    try {
      const response = await fetch(`/api/lists/leave_list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listID: listID }),
      });

      if (!response.ok) {
        console.error("Error leaving list:", response.statusText);
        toast.error("Failed to leave list. Please try again later.");
        return;
      }

      setSharedLists((prevLists) =>
        prevLists.filter((list) => list.id !== listID),
      );
      toast.success("You have successfully left the list.");

      notifySidebarListDeleted(listID);
    } catch (error) {
      console.error("Error leaving list:", error);
      toast.error("Failed to leave list. Please try again later.");
    }
  }

  async function handleJoinList(listID?: string) {
    if (!listID) {
      toast.error(
        "Error joining list. If this error persists, try opening the list and joining it from there.",
      );

      return;
    }

    try {
      const response = await fetch(`/api/lists/join_list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listID: listID }),
      });

      if (!response.ok) {
        console.error("Error joining list:", response.statusText);
        toast.error("Failed to join list. Please try again later.");
        return;
      }

      openPane({ type: "singular_list", listID });
      toast.success("You have successfully joined the list.");

      const listName = recommendedLists.find(
        (list) => list.id === listID,
      )?.name;
      const listColor = recommendedLists.find(
        (list) => list.id === listID,
      )?.color;

      notifySidebarListCreated(listID, listName, listColor);
    } catch (error) {
      console.error("Error joining list:", error);
      toast.error("Failed to join list. Please try again later.");
    }
  }

  const trimmedCombinedUserLists = [...createdLists, ...sharedLists]
    .slice(0, 5)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const filteredOwnedLists = createdLists.filter((list) => {
    const query = ownedSearchQuery.toLowerCase();

    return list.name.toLowerCase().includes(query);
  });

  const filteredSharedLists = sharedLists.filter((list) => {
    const query = sharedSearchQuery.toLowerCase();

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
          <>
            <h3 className="font-bold text-sm">Your lists</h3>

            {trimmedCombinedUserLists.length === 0 ? (
              <p className="mt-2 text-center text-sm text-muted-foreground">
                You aren&apos;t a member of any lists yet. Create your first
                list to see it here!
              </p>
            ) : (
              <div className="grid grid-cols gap-3">
                {filteredOwnedLists.map((list) => (
                  <div
                    key={list.id}
                    className="flex flex-row items-center justify-between py-4 px-6 border border-border rounded-md shadow-sm md:hover:scale-103 transition-transform duration-200 cursor-pointer"
                    onClick={() =>
                      openPane({ type: "singular_list", listID: list.id })
                    }
                  >
                    <div className="flex flex-row items-center gap-4">
                      <span
                        className="inline-block size-4 md:size-6 rounded-full"
                        style={{ backgroundColor: `#${list.color}` }}
                      />

                      <div className="flex flex-col gap-1">
                        <h2 className="font-bold text-md">{list.name}</h2>

                        <div className="font-semibold text-xs md:text-sm text-muted-foreground">
                          <p>
                            {list.placeCount} place
                            {list.placeCount !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="font-semibold text-xs md:text-sm text-muted-foreground">
                      {list.visibility === "Public" ? (
                        <Globe
                          strokeWidth={2.25}
                          className="size-5 md:size-5.5"
                        />
                      ) : list.visibility === "Private" ? (
                        <Lock
                          strokeWidth={2.25}
                          className="size-5 md:size-5.5"
                        />
                      ) : list.visibility === "Shared" ? (
                        <Network
                          strokeWidth={2.25}
                          className="size-5 md:size-5.5"
                        />
                      ) : list.visibility === "Paid access" ? (
                        <CircleDollarSign
                          strokeWidth={2.25}
                          className="size-5 md:size-5.5"
                        />
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h3 className="font-bold text-sm">Featured public lists</h3>

            {recommendedLists.length === 0 ? (
              <p className="mt-2 mb-12 text-center text-sm text-muted-foreground">
                Error fetching recommended lists. Please try again later.
              </p>
            ) : (
              <div className="grid grid-cols gap-3 mb-12">
                {recommendedLists.map((list) => {
                  const ListIconComponent = listIcons.find(
                    (icon) => icon.id === list.icon,
                  )?.icon;

                  return (
                    <div
                      key={list.id}
                      className="flex flex-row items-center justify-between py-4 px-6 border border-border rounded-md shadow-sm cursor-default"
                    >
                      <div className="flex flex-row items-center gap-4">
                        {ListIconComponent ? (
                          <ListIconComponent
                            className="size-12 md:size-16 text-accent rounded-md p-3 md:p-4"
                            strokeWidth={1.5}
                            style={{ backgroundColor: `#${list.color}` }}
                          />
                        ) : (
                          <span
                            className="inline-block size-12 md:size-16 rounded-md"
                            style={{ backgroundColor: `#${list.color}` }}
                          />
                        )}

                        <div className="flex flex-col gap-1">
                          <h2 className="font-bold text-md">{list.name}</h2>

                          <div className="flex flex-col text-xs md:text-sm text-muted-foreground">
                            <p
                              className={`${!list.creatorName ? "italic" : ""} font-semibold`}
                            >
                              By {list.creatorName || "Unknown"}
                            </p>

                            <p className="font-medium">
                              {list.placeCount} place
                              {list.placeCount !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button
                        className="py-5 px-4"
                        onClick={(e) => {
                          e.stopPropagation();

                          handleJoinList(list.id);
                        }}
                      >
                        Join
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
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
              <p className="mt-2 mb-12 text-center text-sm text-muted-foreground">
                You haven&apos;t created any lists yet. Create your first list
                to see it here!
              </p>
            ) : (
              <div className="grid grid-cols gap-3 mb-12">
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
                        className="flex flex-row items-center justify-between p-3 md:p-4 border border-border rounded-md shadow-sm hover:scale-103 transition-transform duration-200 cursor-pointer"
                        onClick={() =>
                          openPane({ type: "singular_list", listID: list.id })
                        }
                      >
                        <div className="flex flex-row items-center gap-4">
                          {ListIconComponent ? (
                            <ListIconComponent
                              className="size-12 md:size-16 text-accent rounded-md p-3 md:p-4"
                              strokeWidth={1.5}
                              style={{ backgroundColor: `#${list.color}` }}
                            />
                          ) : (
                            <span
                              className="inline-block size-12 md:size-16 rounded-md"
                              style={{ backgroundColor: `#${list.color}` }}
                            />
                          )}

                          <div className="flex flex-col gap-1">
                            <h2 className="font-bold text-md md:text-lg">
                              {list.name}
                            </h2>

                            <div className="flex flex-row items-center gap-1 font-semibold text-xs md:text-sm text-muted-foreground">
                              <p>
                                {list.placeCount} place
                                {list.placeCount !== 1 ? "s" : ""}
                              </p>

                              {list.memberCount !== 1 && (
                                <>
                                  <span>•</span>
                                  <p>
                                    {list.memberCount} member
                                    {list.memberCount !== 1 ? "s" : ""}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row items-center gap-2">
                          <div className="flex flex-row items-center gap-1 md:gap-2 bg-accent rounded-md py-2 px-2 md:px-4 font-semibold text-xs md:text-sm text-muted-foreground">
                            {list.visibility === "Public" ? (
                              <Globe
                                strokeWidth={2.25}
                                className="size-3 md:size-3.5"
                              />
                            ) : list.visibility === "Private" ? (
                              <Lock
                                strokeWidth={2.25}
                                className="size-3 md:size-3.5"
                              />
                            ) : list.visibility === "Shared" ? (
                              <Network
                                strokeWidth={2.25}
                                className="size-3 md:size-3.5"
                              />
                            ) : list.visibility === "Paid access" ? (
                              <CircleDollarSign
                                strokeWidth={2.25}
                                className="size-3 md:size-3.5"
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
                                    className="size-9 md:size-10"
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

                                    setFocusedListID(list.id);
                                    setDeletePopupOpen(true);
                                  }}
                                >
                                  <Trash2 /> Delete list
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>
        ) : section === "shared" ? (
          <>
            <div className="flex flex-row justify-between items-center">
              <p className="font-bold text-sm">
                {sharedLists.length} list{sharedLists.length !== 1 ? "s" : ""}
              </p>

              <InputGroup className="p-1 py-4 max-w-48">
                <InputGroupInput
                  id="search-input"
                  placeholder="Search shared lists..."
                  value={sharedSearchQuery}
                  onChange={(e) => setSharedSearchQuery(e.target.value)}
                />
                <InputGroupAddon>
                  <Search className="h-4 w-4" />
                </InputGroupAddon>
              </InputGroup>
            </div>

            {sharedLists.length === 0 ? (
              <div className="flex flex-col items-center gap-2 mt-2 mb-12">
                <p className="text-center text-sm text-muted-foreground">
                  You haven&apos;t joined any lists yet. Click the button below
                  to find some public lists!
                </p>

                <Button onClick={() => setSection("all")} className="p-4">
                  Discover public lists
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols gap-3 mb-12">
                {filteredSharedLists.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 mt-2">
                    <p className="text-sm">
                      No lists found that match your search query.
                    </p>
                    <Button
                      size="lg"
                      className="p-4"
                      onClick={() => setSharedSearchQuery("")}
                    >
                      Clear search
                    </Button>
                  </div>
                ) : (
                  filteredSharedLists.map((list) => {
                    const ListIconComponent = listIcons.find(
                      (icon) => icon.id === list.icon,
                    )?.icon;

                    return (
                      <div
                        key={list.id}
                        className="flex flex-row items-center justify-between p-3 md:p-4 border border-border rounded-md shadow-sm hover:scale-103 transition-transform duration-200 cursor-pointer"
                        onClick={() =>
                          openPane({ type: "singular_list", listID: list.id })
                        }
                      >
                        <div className="flex flex-row items-center gap-4">
                          {ListIconComponent ? (
                            <ListIconComponent
                              className="size-12 md:size-16 text-accent rounded-md p-3 md:p-4"
                              strokeWidth={1.5}
                              style={{ backgroundColor: `#${list.color}` }}
                            />
                          ) : (
                            <span
                              className="inline-block size-12 md:size-16 rounded-md"
                              style={{ backgroundColor: `#${list.color}` }}
                            />
                          )}

                          <div className="flex flex-col gap-1">
                            <h2 className="font-bold text-md md:text-lg">
                              {list.name}
                            </h2>

                            <div className="flex flex-row items-center gap-1 font-semibold text-xs md:text-sm text-muted-foreground">
                              <p>
                                {list.placeCount} place
                                {list.placeCount !== 1 ? "s" : ""}
                              </p>

                              <span>•</span>
                              <p>{list.memberCount} members</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row items-center gap-2">
                          <div className="flex flex-row items-center gap-1 md:gap-2 bg-accent rounded-md py-2 px-2 md:px-4 font-semibold text-xs md:text-sm text-muted-foreground">
                            {list.role === "Admin" ? (
                              <UserRoundCog
                                strokeWidth={2.5}
                                className="size-3.5"
                              />
                            ) : list.role === "Editor" ? (
                              <Pencil strokeWidth={2.5} className="size-3.5" />
                            ) : list.role === "Viewer" ? (
                              <Eye strokeWidth={2.5} className="size-3.5" />
                            ) : null}
                            <p>{list.role}</p>
                          </div>

                          <div>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button
                                    variant="outline"
                                    onClick={(e) => e.stopPropagation()}
                                    className="size-9 md:size-10"
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

                                    handleLeaveList(list.id);
                                  }}
                                >
                                  <LogOut /> Leave list
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>
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
