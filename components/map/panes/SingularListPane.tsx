"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useInfoPane } from ".././InfoPaneContext";

import { listIcons } from "@/components/map/ListIcons";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  ArrowDownAZ,
  Bookmark,
  CalendarArrowDown,
  CalendarArrowUp,
  ChevronLeft,
  Ellipsis,
  Lock,
  Globe,
  ListSortDescending,
  Search,
  Network,
  CircleDollarSign,
  MapPin,
  Users,
  Trash2,
  Settings,
  Link2,
  LogOut,
} from "lucide-react";

interface ListMember {
  id: string;
  name: string;
  profileImageURL: string | null;
  role: string;
  joinedAt: Date;
}

interface ListItem {
  id: string;
  name: string;
  imageURL: string;
  address: string;
  addedAt: Date;
  addedBy: string | null;
}

interface ListData {
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  visibility: string;
  listColor: string;
  listIcon: string | null;
  items: ListItem[];
  members: ListMember[];
}

type ListSidebarEventDetail = {
  action: "deleted";
  listID: string;
};

const LIST_SIDEBAR_EVENT = "sevnmaps:list-sidebar-updated";

function notifySidebarListDeleted(listID: string) {
  window.dispatchEvent(
    new CustomEvent<ListSidebarEventDetail>(LIST_SIDEBAR_EVENT, {
      detail: { action: "deleted", listID },
    }),
  );
}

function SingularListPane({ listID }: { listID: string }) {
  const [listData, setListData] = useState<ListData | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortType, setSortType] = useState<
    "dateAddedOldest" | "dateAddedNewest" | "name"
  >("dateAddedNewest");
  const [loading, setLoading] = useState(true);

  const { openPane } = useInfoPane();
  const router = useRouter();

  const fetchListData = useCallback(async () => {
    setLoading(true);

    if (!listID) {
      return null;
    }
    try {
      const response = await fetch(
        `/api/lists/get_list_data?listID=${listID}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        console.error("Failed to fetch list data:", response.statusText);
        return;
      }

      const data = await response.json();
      setListData(data.listData);
      const userID = data.userID;

      const userMember = data.listData.members.find(
        (member: ListMember) => member.id === userID,
      );
      if (userMember) {
        setUserRole(userMember.role);
      } else {
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching list data:", error);
    }
  }, [listID]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchListData();
    };

    fetchData();
  }, [fetchListData]);

  async function handleLeaveList() {
    try {
      const response = await fetch(`/api/lists/leave_list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listID }),
      });

      if (!response.ok) {
        console.error("Error leaving list:", response.statusText);
        toast.error("Failed to leave list. Please try again later.");
        return;
      }

      openPane({ type: "lists" });
      toast.success("You have successfully left the list.");
    } catch (error) {
      console.error("Error leaving list:", error);
      toast.error("Failed to leave list. Please try again later.");
    }
  }

  async function handleDeleteList() {
    try {
      const response = await fetch(`/api/lists/delete_list`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listID }),
      });

      if (!response.ok) {
        console.error("Error deleting list:", response.statusText);
        toast.error("Failed to delete list. Please try again later.");
        return;
      }

      openPane({ type: "lists" });
      toast.success("List deleted.");
      router.refresh();

      window.setTimeout(() => {
        notifySidebarListDeleted(listID);
      }, 0);
    } catch (error) {
      console.error("Error deleting list:", error);
      toast.error("Failed to delete list. Please try again later.");
    }
  }

  const filteredListItems = listData?.items.filter((item) => {
    const query = searchQuery.toLowerCase();

    return (
      item.name.toLowerCase().includes(query) ||
      item.address.toLowerCase().includes(query)
    );
  });

  const sortedListItems = [...(filteredListItems ?? [])].sort((a, b) => {
    switch (sortType) {
      case "dateAddedOldest":
        return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();

      case "dateAddedNewest":
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();

      case "name":
        return a.name.localeCompare(b.name);

      default:
        return 0;
    }
  });

  const ListIconComponent = listIcons.find(
    (icon) => icon.id === listData?.listIcon,
  )?.icon;

  return (
    <div className="flex flex-col gap-6 mt-5">
      <div className="flex flex-row items-center gap-4 mb-2">
        <Button
          variant="outline"
          className="flex flex-row items-center gap-2"
          onClick={() => openPane({ type: "lists" })}
        >
          <ChevronLeft />
          All lists
        </Button>
        <h1 className="text-lg font-semibold">List info</h1>
      </div>

      {loading ? (
        <div className="flex flex-row items-center gap-2">
          <Spinner />
          <p className="text-sm">Loading...</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4 p-4 border border-border rounded-md shadow-xs">
            <div className="flex flex-row justify-between items-center w-full">
              <div className="flex flex-row items-center gap-4">
                {ListIconComponent ? (
                  <ListIconComponent
                    className="h-20 w-20 text-accent rounded-md p-4"
                    strokeWidth={1.5}
                    style={{ backgroundColor: `#${listData?.listColor}` }}
                  />
                ) : (
                  <span
                    className={`inline-block w-20 h-20 rounded-md`}
                    style={{ backgroundColor: `#${listData?.listColor}` }}
                  />
                )}
                <div className="flex flex-col gap-1">
                  <h2 className="font-bold text-lg">{listData?.name}</h2>
                  <p
                    className={`${listData?.description ? "font-semibold" : "italic"} text-sm text-muted-foreground`}
                  >
                    {listData?.description || "No description"}
                  </p>
                </div>
              </div>

              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="outline" className="h-10 w-10">
                      <Ellipsis className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-40">
                    {userRole === "Creator" && (
                      <DropdownMenuItem>
                        <Settings /> Manage list
                      </DropdownMenuItem>
                    )}
                    {listData?.visibility === "Public" &&
                      userRole === "Creator" && (
                        <DropdownMenuItem>
                          <Link2 /> Copy link
                        </DropdownMenuItem>
                      )}
                    {userRole === "Creator" && <DropdownMenuSeparator />}
                    {userRole === "Creator" ? (
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={handleDeleteList}
                      >
                        <Trash2 /> Delete list
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={handleLeaveList}
                      >
                        <LogOut /> Leave list
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex flex-row gap-2 cursor-default">
              <div className="flex flex-row items-center gap-2 bg-accent rounded-md py-1.5 px-3 font-semibold text-sm text-muted-foreground">
                <MapPin strokeWidth={2.25} className="h-4 w-4" />
                <p>
                  {listData?.items.length}{" "}
                  {listData?.items.length === 1 ? "place" : "places"}
                </p>
              </div>
              <div className="flex flex-row items-center gap-2 bg-accent rounded-md py-1.5 px-3 font-semibold text-sm text-muted-foreground">
                <Users strokeWidth={2.25} className="h-4 w-4" />
                <p>
                  {listData?.members.length}{" "}
                  {listData?.members.length === 1 ? "member" : "members"}
                </p>
              </div>
              <div className="flex flex-row items-center gap-2 bg-accent rounded-md py-1.5 px-3 font-semibold text-sm text-muted-foreground">
                {listData?.visibility === "Public" ? (
                  <Globe strokeWidth={2.25} className="h-4 w-4" />
                ) : listData?.visibility === "Private" ? (
                  <Lock strokeWidth={2.25} className="h-4 w-4" />
                ) : listData?.visibility === "Shared" ? (
                  <Network strokeWidth={2.25} className="h-4 w-4" />
                ) : listData?.visibility === "Paid access" ? (
                  <CircleDollarSign strokeWidth={2.25} className="h-4 w-4" />
                ) : null}
                <p>{listData?.visibility}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-row items-center justify-between">
            <p className="font-bold text-sm">
              {listData?.items.length}{" "}
              {listData?.items.length === 1 ? "place" : "places"}
            </p>

            <div className="flex flex-row gap-1">
              <InputGroup className="p-1 py-4 max-w-48">
                <InputGroupInput
                  id="search-input"
                  placeholder="Search places..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <InputGroupAddon>
                  <Search className="h-4 w-4" />
                </InputGroupAddon>
              </InputGroup>

              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="outline">
                    <ListSortDescending className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40">
                  <DropdownMenuItem
                    onClick={() => {
                      setSortType("dateAddedNewest");
                    }}
                  >
                    <CalendarArrowUp /> Newest at top
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSortType("dateAddedOldest");
                    }}
                  >
                    <CalendarArrowDown /> Oldest at top
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortType("name")}>
                    <ArrowDownAZ /> Name (A-Z)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {listData?.items.length === 0 ? (
              <p className="mt-2 text-center text-sm text-muted-foreground">
                This list seems to be a little empty. Start exploring the map
                and tap the &quot;add to list&quot; button to see them appear
                here!
              </p>
            ) : !filteredListItems ||
              !sortedListItems ||
              filteredListItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 mt-2">
                <p className="text-sm">
                  No places found that match your search query.
                </p>
                <Button
                  size="lg"
                  className="p-4"
                  onClick={() => setSearchQuery("")}
                >
                  Clear search
                </Button>
              </div>
            ) : (
              sortedListItems.map((item, index) => (
                <div
                  key={item.id}
                  title={`Added by ${listData?.members?.find((m) => m.id === item.addedBy)?.name || "Unknown"} on ${new Date(item.addedAt).toLocaleString()}`}
                  className="flex flex-row items-center gap-3 p-2 cursor-default"
                >
                  <p className="flex h-8 w-8 items-center justify-center bg-muted text-muted-foreground rounded-md font-semibold text-sm">
                    {index + 1}
                  </p>

                  <div className="relative w-20 h-20 shrink-0">
                    <Image
                      src={item.imageURL}
                      alt={item.name}
                      fill
                      sizes="150px"
                      className="w-full h-full rounded-md"
                    />
                  </div>

                  <div className="p-1">
                    <h3 className="font-bold mb-2">{item.name}</h3>
                    <p className="font-semibold text-sm text-muted-foreground break-all">
                      {item.address}
                    </p>
                  </div>

                  <div className="flex items-center justify-end px-4 ml-auto">
                    <Bookmark className="h-7 w-7 cursor-pointer hover:scale-110 transition-all fill-blue-500 stroke-blue-500" />
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      <Toaster position="top-center" />
    </div>
  );
}

export default SingularListPane;
