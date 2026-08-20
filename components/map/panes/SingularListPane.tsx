"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useInfoPane } from ".././InfoPaneContext";
import { getImageURL } from "@/lib/images";

import ConfirmationPopup from "@/components/utility/ConfirmationPopup";
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  Ban,
  ChevronDown,
  CircleUserRound,
  Pencil,
  Eye,
  UserRoundCog,
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
  action: "deleted" | "updated" | "added";
  listID: string;
  newListName?: string;
  newListColor?: string;
};

const LIST_SIDEBAR_EVENT = "sevnmaps:list-sidebar-updated";

function notifySidebarListDeleted(listID: string) {
  window.dispatchEvent(
    new CustomEvent<ListSidebarEventDetail>(LIST_SIDEBAR_EVENT, {
      detail: { action: "deleted", listID },
    }),
  );
}

function notifySidebarListUpdated(
  listID: string,
  newListName?: string,
  newListColor?: string,
) {
  window.dispatchEvent(
    new CustomEvent<ListSidebarEventDetail>(LIST_SIDEBAR_EVENT, {
      detail: { action: "updated", listID, newListName, newListColor },
    }),
  );
}

function SingularListPane({ listID }: { listID: string }) {
  const [listData, setListData] = useState<ListData | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [deletePopupOpen, setDeletePopupOpen] = useState<boolean>(false);
  const [markPrivatePopupOpen, setMarkPrivatePopupOpen] =
    useState<boolean>(false);
  const [privacyDropdownOpen, setPrivacyDropdownOpen] =
    useState<boolean>(false);
  const [privacyCollapsibleOpen, setPrivacyCollapsibleOpen] =
    useState<boolean>(false);
  const [memberRoleDropdownOpen, setMemberRoleDropdownOpen] =
    useState<boolean>(false);
  const [highestPlanType, setHighestPlanType] = useState<string | null>(null);
  const [inviteUIVisible, setInviteUIVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortType, setSortType] = useState<
    "dateAddedOldest" | "dateAddedNewest" | "name"
  >("dateAddedNewest");
  const [newListName, setNewListName] = useState<string>("");
  const [newListDescription, setNewListDescription] = useState<string | null>(
    null,
  );
  const [newListColor, setNewListColor] = useState<string>("#1273F6");
  const [newListIcon, setNewListIcon] = useState<string | null>(null);
  const [newListPrivacy, setNewListPrivacy] = useState<string>("");
  const [newMemberEmail, setNewMemberEmail] = useState<string>("");
  const [newMemberRole, setNewMemberRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const { openPane } = useInfoPane();
  const router = useRouter();

  const fetchListData = useCallback(async () => {
    setLoading(true);

    if (!listID) {
      return null;
    }
    try {
      const listResponse = await fetch(
        `/api/lists/get_list_data?listID=${listID}`,
      );

      if (!listResponse.ok) {
        console.error("Failed to fetch list data:", listResponse.statusText);
        toast.error("Failed to fetch list data. Please try again later.");

        return;
      }

      const listData = await listResponse.json();

      if (!listData || !listData.listData) {
        toast.error("Error fetching list data. Please try again later.");
        return;
      }

      setListData(listData.listData);

      const userID = listData.userID;

      const userMember = listData.listData.members.find(
        (member: ListMember) => member.id === userID,
      );
      const creatorID = listData.listData.members.find(
        (member: ListMember) => member.role === "Creator",
      )?.id;

      if (userMember) {
        setUserRole(userMember.role);
      } else {
        return;
      }

      let planResponse: Response | null = null;

      if (userMember?.role === "Creator") {
        planResponse = await fetch(
          `/api/billing/get_highest_plan_info?userIDs=${userID}`,
        );
      } else {
        planResponse = await fetch(
          `/api/billing/get_highest_plan_info?userIDs=${[userID, creatorID].join(",")}`,
        );
      }

      if (!planResponse.ok) {
        console.error("Failed to fetch plan data:", planResponse.statusText);
        toast.error("Failed to fetch plan data. Please try again later.");

        return;
      }

      const planData = await planResponse.json();

      if (!planData || !planData.planType) {
        toast.error(
          "Error fetching plan data. Your experience may be downgraded.",
        );
      }

      setHighestPlanType(planData.planType);

      setNewListName(listData.listData.name);
      setNewListDescription(listData.listData.description);
      setNewListColor("#" + listData.listData.listColor);
      setNewListIcon(listData.listData.listIcon);

      setNewListPrivacy(listData.listData.visibility);

      setInviteUIVisible(false);
      setPrivacyCollapsibleOpen(false);
      setNewMemberEmail("");
      setNewMemberRole("");
      setSearchQuery("");
      setSortType("dateAddedNewest");

      setLoading(false);
    } catch (error) {
      console.error("Error fetching list data:", error);
      toast.error("Failed to fetch list data. Please try again later.");
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

  async function handleSaveListSettings() {
    setLoading(true);

    if (newListName.trim() === "") {
      toast.info("List name cannot be empty.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/lists/update_list_info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listID,
          newName: newListName,
          newDescription: newListDescription,
          newColor: newListColor.slice(1),
          newIcon: newListIcon,
        }),
      });

      if (!response.ok) {
        console.error("Error saving list settings:", response.statusText);
        toast.error("Failed to save list settings. Please try again later.");
        setLoading(false);
        return;
      }

      toast.success("List settings saved.");

      setListData((prevData) => {
        if (!prevData) return prevData;

        return {
          ...prevData,
          name: newListName,
          description: newListDescription,
          listColor: newListColor.slice(1),
          listIcon: newListIcon,
        };
      });

      setLoading(false);
      setDialogOpen(false);

      window.setTimeout(() => {
        notifySidebarListUpdated(listID, newListName, newListColor.slice(1));
      }, 0);
    } catch (error) {
      console.error("Error saving list settings:", error);
      toast.error("Failed to save list settings. Please try again later.");
      setLoading(false);
    }
  }

  async function handleChangePrivacy(privacy: string) {
    setLoading(true);

    try {
      const response = await fetch("/api/lists/update_list_privacy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listID,
          newPrivacy: privacy,
        }),
      });

      if (!response.ok) {
        console.error("Error changing list privacy:", response.statusText);
        toast.error("Failed to change list privacy. Please try again later.");
        setLoading(false);
        return;
      }

      toast.success("List privacy updated.");

      setListData((prevData) => {
        if (!prevData) return prevData;

        return {
          ...prevData,
          visibility: privacy,
        };
      });

      if (privacy === "Private") {
        setListData((prevData) => {
          if (!prevData) return prevData;

          return {
            ...prevData,
            members: prevData.members.filter(
              (member) => member.role === "Creator",
            ),
          };
        });
      }

      setNewListPrivacy(privacy);
      setLoading(false);
      setDialogOpen(false);
    } catch (error) {
      console.error("Error changing list privacy:", error);
      toast.error("Failed to change list privacy. Please try again later.");
      setLoading(false);
    }
  }

  const handleChangeMemberRole = async (memberID: string, value: string) => {
    setLoading(true);

    try {
      const response = await fetch("/api/lists/update_member_role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listID,
          memberID,
          newRole: value,
        }),
      });

      if (!response.ok) {
        console.error("Error changing member role:", response.statusText);
        toast.error("Failed to change member's role. Please try again later.");
        setLoading(false);
        return;
      }

      toast.success("Member's role updated.");

      setListData((prevData) => {
        if (!prevData) return prevData;

        const updatedMembers = prevData.members.map((member) => {
          if (member.id === memberID) {
            return {
              ...member,
              role: value,
            };
          }
          return member;
        });

        return {
          ...prevData,
          members: updatedMembers,
        };
      });

      setLoading(false);
    } catch (error) {
      console.error("Error changing member role:", error);
      toast.error("Failed to change member's role. Please try again later.");
      setLoading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!newMemberEmail.trim() || !newMemberRole) {
      toast.info("Please provide both an email and a role for the new member.");
      return;
    }

    try {
      const response = await fetch("/api/lists/invite_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listID,
          email: newMemberEmail,
          role: newMemberRole,
        }),
      });

      if (!response.ok) {
        console.error("Error inviting user:", response.statusText);
        toast.error("Failed to invite user. Please try again later.");
        return;
      }

      toast.success(
        "User invited to list (given they have a SevnMaps account).",
      );

      setNewMemberEmail("");
      setNewMemberRole("");
      setInviteUIVisible(false);
    } catch (error) {
      console.error("Error inviting user:", error);
      toast.error("Failed to invite user. Please try again later.");
    }
  };

  const handleRemoveMember = async (memberID: string) => {
    setLoading(true);

    try {
      const response = await fetch("/api/lists/remove_member", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listID,
          memberID,
        }),
      });

      if (!response.ok) {
        console.error("Error removing member:", response.statusText);
        toast.error("Failed to remove member. Please try again later.");
        setLoading(false);
        return;
      }

      toast.success("Member removed from list.");

      setListData((prevData) => {
        if (!prevData) return prevData;

        const updatedMembers = prevData.members.filter(
          (member) => member.id !== memberID,
        );

        return {
          ...prevData,
          members: updatedMembers,
        };
      });

      setLoading(false);
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member. Please try again later.");
      setLoading(false);
    }
  };

  const handleRemoveItemFromList = async (placeID: string) => {
    setLoading(true);

    try {
      const response = await fetch("/api/lists/remove_place", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listID,
          placeID,
        }),
      });

      if (!response.ok) {
        console.error("Error removing item:", response.statusText);
        toast.error(
          "Failed to remove place from list. Please try again later.",
        );
        setLoading(false);
        return;
      }

      toast.success("Place removed from the list.");

      setListData((prevData) => {
        if (!prevData) return prevData;

        const updatedItems = prevData.items.filter(
          (item) => item.id !== placeID,
        );

        return {
          ...prevData,
          items: updatedItems,
        };
      });

      setLoading(false);
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove place from list. Please try again later.");
      setLoading(false);
    }
  };

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

  function handleCopyLink() {
    if (!listData) return;

    const shareLink = `${window.location.origin}/map/list/${listID}`;

    navigator.clipboard
      .writeText(shareLink)
      .then(() => {
        toast.success("Copied list link to clipboard!");
      })
      .catch((error) => {
        console.error("Failed to copy share link:", error);

        toast.error("Failed to copy list link. Please try again later.");
      });
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6 mt-5">
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
          <div className="flex flex-col gap-4 p-3 md:p-4 border border-border rounded-md shadow-xs">
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
                  <DropdownMenuTrigger
                    render={<Button variant="outline" className="h-10 w-10" />}
                  >
                    <Ellipsis className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-40">
                    {(userRole === "Creator" || userRole === "Admin") && (
                      <DropdownMenuItem onClick={() => setDialogOpen(true)}>
                        <Settings /> Manage list
                      </DropdownMenuItem>
                    )}

                    {(listData?.visibility === "Public" ||
                      listData?.visibility === "Shared") &&
                      (userRole === "Creator" || userRole === "Admin") && (
                        <DropdownMenuItem onClick={handleCopyLink}>
                          <Link2 /> Copy public link
                        </DropdownMenuItem>
                      )}

                    {userRole === "Creator" || userRole === "Admin" ? (
                      <DropdownMenuSeparator />
                    ) : null}

                    {userRole === "Creator" ? (
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeletePopupOpen(true)}
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

            <div className="flex flex-row gap-1.5 md:gap-2 cursor-default">
              <div className="flex flex-row items-center gap-2 bg-accent rounded-md py-2 px-2 md:px-4 font-semibold text-sm text-muted-foreground">
                <MapPin strokeWidth={2.25} className="size-3.5" />
                <p>
                  {listData?.items.length}{" "}
                  {listData?.items.length === 1 ? "place" : "places"}
                </p>
              </div>
              <div className="flex flex-row items-center gap-2 bg-accent rounded-md py-2 px-2 md:px-4 font-semibold text-sm text-muted-foreground">
                <Users strokeWidth={2.25} className="size-3.5" />
                <p>
                  {listData?.members.length}{" "}
                  {listData?.members.length === 1 ? "member" : "members"}
                </p>
              </div>
              <div
                className={`flex flex-row items-center gap-2 bg-accent rounded-md py-2 px-2 md:px-4 font-semibold text-sm text-muted-foreground ${userRole === "Creator" || userRole === "Admin" ? "cursor-pointer" : ""}`}
                onClick={() => {
                  if (userRole === "Creator" || userRole === "Admin") {
                    setDialogOpen(true);
                    setPrivacyCollapsibleOpen(true);
                  }
                }}
              >
                {listData?.visibility === "Public" ? (
                  <Globe strokeWidth={2.25} className="size-3.5" />
                ) : listData?.visibility === "Private" ? (
                  <Lock strokeWidth={2.25} className="size-3.5" />
                ) : listData?.visibility === "Shared" ? (
                  <Network strokeWidth={2.25} className="size-3.5" />
                ) : listData?.visibility === "Paid access" ? (
                  <CircleDollarSign strokeWidth={2.25} className="size-3.5" />
                ) : null}
                <p>{listData?.visibility}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-row gap-1 items-center justify-between">
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
                <DropdownMenuTrigger render={<Button variant="outline" />}>
                  <ListSortDescending className="h-4 w-4" />
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

          <div className="grid grid-cols-1 gap-1">
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
                  className="flex flex-row items-center gap-3 p-3 md:p-4 border border-transparent hover:border-border rounded-md cursor-pointer hover:bg-accent/50 transition-all"
                  onClick={() => openPane({ type: "place", placeID: item.id })}
                >
                  <p className="flex size-6 md:size-8 shrink-0 items-center justify-center bg-muted text-muted-foreground rounded-md font-semibold text-sm">
                    {index + 1}
                  </p>

                  <div className="relative w-20 h-20 shrink-0">
                    <Image
                      src={getImageURL(item.imageURL, true)}
                      alt={item.name}
                      fill
                      sizes="80px"
                      draggable={false}
                      className="object-cover rounded-md"
                    />
                  </div>

                  <div className="p-1">
                    <h3 className="font-bold mb-2">{item.name}</h3>
                    <p className="font-semibold text-sm text-muted-foreground">
                      {item.address}
                    </p>
                  </div>

                  <div className="flex items-center justify-end pl-2 ml-auto">
                    <Bookmark
                      onClick={(e) => {
                        e.stopPropagation();

                        if (
                          userRole === "Creator" ||
                          userRole === "Admin" ||
                          userRole === "Editor"
                        ) {
                          handleRemoveItemFromList(item.id);
                        }
                      }}
                      className={`h-7 w-7 ${
                        userRole !== "Creator" &&
                        userRole !== "Admin" &&
                        userRole !== "Editor"
                          ? "cursor-not-allowed fill-blue-500 stroke-blue-500 opacity-50"
                          : "cursor-pointer hover:scale-110 transition-all fill-blue-500 stroke-blue-500"
                      }
                      `}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage list</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <Collapsible className="data-open:bg-muted rounded-md">
              <CollapsibleTrigger className="group flex flex-row items-center w-full px-6 data-panel-open:pt-3">
                <h4 className="font-semibold text-base">List settings</h4>
                <ChevronDown className="h-4 w-4 ml-auto transition-transform group-data-panel-open:rotate-180" />
              </CollapsibleTrigger>

              <CollapsibleContent className="p-4">
                <FieldGroup>
                  <Field>
                    <Label htmlFor="listName">List name</Label>
                    <Input
                      id="listName"
                      type="text"
                      placeholder={listData?.name}
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <Label htmlFor="listDescription">Description</Label>
                    <Input
                      id="listDescription"
                      type="text"
                      placeholder={listData?.description || "Empty"}
                      className={newListDescription === null ? "" : "italic"}
                      value={newListDescription ?? ""}
                      onChange={(e) =>
                        setNewListDescription(
                          e.target.value.trim() === "" ? null : e.target.value,
                        )
                      }
                    />
                  </Field>
                  <Field>
                    <Label htmlFor="listColor">List colour</Label>
                    <Input
                      id="listColor"
                      type="color"
                      defaultValue={newListColor}
                      className="w-8! h-8! p-0"
                      value={newListColor}
                      onChange={(e) => setNewListColor(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <Label>List icon</Label>
                    <div className="grid grid-cols-8 rounded-lg border border-border p-2">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-md ${newListIcon === null ? "bg-primary/50 hover:bg-primary/30" : "hover:bg-primary/20"}`}
                        onClick={() => setNewListIcon(null)}
                      >
                        <Ban className="w-5 h-5" />
                      </div>

                      {listIcons.map(({ id, icon: Icon }) => (
                        <div
                          key={id}
                          className={`flex h-10 w-10 items-center justify-center rounded-md ${newListIcon === id ? "bg-primary/50 hover:bg-primary/30" : "hover:bg-primary/20"}`}
                          onClick={() => setNewListIcon(id)}
                        >
                          <Icon
                            className="w-5 h-5"
                            style={{ color: `${newListColor}` }}
                          />
                        </div>
                      ))}
                    </div>
                  </Field>

                  <Button
                    type="submit"
                    disabled={
                      loading ||
                      (newListName === listData?.name &&
                        newListDescription === listData?.description &&
                        newListColor === `#${listData?.listColor}` &&
                        newListIcon === listData?.listIcon)
                    }
                    onClick={handleSaveListSettings}
                  >
                    Save
                  </Button>
                </FieldGroup>
              </CollapsibleContent>
            </Collapsible>

            {userRole === "Creator" || userRole === "Admin" ? (
              <div>
                <div
                  className={`flex flex-row items-center w-full px-6 rounded-t-md ${privacyCollapsibleOpen ? "pt-3 bg-muted" : ""}`}
                  onClick={() => setPrivacyCollapsibleOpen((prev) => !prev)}
                >
                  <h4 className="font-semibold text-base cursor-default select-none">
                    List sharing
                  </h4>
                  <ChevronDown
                    className={`h-4 w-4 ml-auto transition-transform ${privacyCollapsibleOpen ? "rotate-180" : ""}`}
                  />
                </div>

                <Collapsible
                  open={privacyCollapsibleOpen}
                  onOpenChange={setPrivacyCollapsibleOpen}
                  className="data-open:bg-muted rounded-b-md"
                >
                  <CollapsibleContent className="p-4">
                    <FieldGroup>
                      <Field orientation="horizontal">
                        <Label htmlFor="privacyOptions">Privacy</Label>

                        <DropdownMenu
                          open={privacyDropdownOpen}
                          onOpenChange={setPrivacyDropdownOpen}
                        >
                          <DropdownMenuTrigger
                            id="privacyOptions"
                            className="ml-auto"
                            render={<Button variant="outline" />}
                          >
                            {listData?.visibility === "Public" ? (
                              <Globe className="h-4 w-4 mr-1" />
                            ) : listData?.visibility === "Private" ? (
                              <Lock className="h-4 w-4 mr-1" />
                            ) : listData?.visibility === "Shared" ? (
                              <Network className="h-4 w-4 mr-1" />
                            ) : listData?.visibility === "Paid access" ? (
                              <CircleDollarSign className="h-4 w-4 mr-1" />
                            ) : null}
                            {newListPrivacy}
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-40">
                            <DropdownMenuGroup>
                              <DropdownMenuRadioGroup
                                value={newListPrivacy}
                                onValueChange={(value) => {
                                  if (
                                    value === "Private" &&
                                    listData?.visibility !== "Private"
                                  ) {
                                    setMarkPrivatePopupOpen(true);
                                  } else {
                                    handleChangePrivacy(value);
                                  }
                                }}
                              >
                                <DropdownMenuRadioItem value="Private">
                                  <Lock strokeWidth={1.5} />
                                  Private
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="Public">
                                  <Globe strokeWidth={1.5} />
                                  Public
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="Shared">
                                  <Network strokeWidth={1.5} />
                                  Shared
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="Paid access">
                                  <CircleDollarSign strokeWidth={1.5} />
                                  Paid access
                                </DropdownMenuRadioItem>
                              </DropdownMenuRadioGroup>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </Field>

                      <Separator />

                      <Field orientation="horizontal">
                        <Label>Members</Label>

                        <Tooltip>
                          <TooltipTrigger
                            className="ml-auto"
                            render={
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  if (
                                    listData?.visibility !== "Private" &&
                                    highestPlanType !== "free"
                                  ) {
                                    setInviteUIVisible((prev) => !prev);
                                  }
                                }}
                                className={`text-primary ${listData?.visibility === "Private" || highestPlanType === "free" ? "opacity-50 hover:bg-muted" : ""}`}
                              >
                                Invite
                              </Button>
                            }
                          />
                          {listData?.visibility === "Private" && (
                            <TooltipContent>
                              <p>
                                You cannot invite members to a private list.
                              </p>
                            </TooltipContent>
                          )}
                          {highestPlanType === "free" &&
                            listData?.visibility !== "Private" && (
                              <TooltipContent>
                                <p>
                                  You{" "}
                                  {userRole !== "Creator" &&
                                    "(or the list owner) "}
                                  must have a paid plan to collaborate on lists.
                                </p>
                              </TooltipContent>
                            )}
                        </Tooltip>
                      </Field>

                      <div className="flex flex-col gap-2">
                        <FieldGroup
                          className={`rounded-md overflow-hidden transition-all duration-300 ease-out ${inviteUIVisible ? "max-h-96 mb-4 border border-border p-3" : "max-h-0"}`}
                        >
                          <Field>
                            <Label>Email address</Label>
                            <Input
                              type="email"
                              placeholder="Email"
                              value={newMemberEmail}
                              onChange={(e) =>
                                setNewMemberEmail(e.target.value)
                              }
                            />
                          </Field>

                          <Field>
                            <Label>Role</Label>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={<Button variant="outline" />}
                              >
                                {newMemberRole === "Admin" && <UserRoundCog />}
                                {newMemberRole === "Editor" && <Pencil />}
                                {newMemberRole === "Viewer" && <Eye />}
                                {newMemberRole || "Select role"}
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-40">
                                <DropdownMenuGroup>
                                  <DropdownMenuRadioGroup
                                    value={newMemberRole}
                                    onValueChange={setNewMemberRole}
                                  >
                                    <DropdownMenuRadioItem value="Admin">
                                      <UserRoundCog strokeWidth={1.5} />
                                      Admin
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="Editor">
                                      <Pencil strokeWidth={1.5} />
                                      Editor
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="Viewer">
                                      <Eye strokeWidth={1.5} />
                                      Viewer
                                    </DropdownMenuRadioItem>
                                  </DropdownMenuRadioGroup>
                                </DropdownMenuGroup>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </Field>

                          <Button
                            type="submit"
                            disabled={!newMemberEmail || !newMemberRole}
                            onClick={handleInviteMember}
                          >
                            Invite member
                          </Button>
                          <p className="text-center text-xs text-muted-foreground italic">
                            Note: the invited user must already have a SevnMaps
                            account with the given email address.
                          </p>
                        </FieldGroup>

                        {listData?.members.map((member) => (
                          <div
                            key={member.id}
                            className="flex flex-row justify-between cursor-default"
                          >
                            <div className="flex flex-row items-center gap-4">
                              <div className="relative w-8 h-8 shrink-0">
                                {member.profileImageURL ? (
                                  <Image
                                    src={member.profileImageURL}
                                    alt={member.name}
                                    fill
                                    sizes="40px"
                                    className="w-full h-full rounded-full border-2 border-primary"
                                  />
                                ) : (
                                  <CircleUserRound
                                    strokeWidth={1.5}
                                    className="w-8 h-8 bg-primary text-primary-foreground rounded-full"
                                  />
                                )}
                              </div>
                              <div>
                                <h5 className="font-semibold">
                                  {member.role === "Creator"
                                    ? `${member.name} (You)`
                                    : member.name}
                                </h5>
                                <p className="text-sm text-muted-foreground">
                                  {member.role !== "Creator"
                                    ? `Joined: ${new Date(member.joinedAt).toLocaleDateString()}`
                                    : "Creator"}
                                </p>
                              </div>
                            </div>

                            <div>
                              {member.role !== "Creator" ? (
                                <DropdownMenu
                                  open={memberRoleDropdownOpen}
                                  onOpenChange={setMemberRoleDropdownOpen}
                                >
                                  <DropdownMenuTrigger
                                    render={
                                      <Button
                                        variant="outline"
                                        className="ml-auto"
                                      />
                                    }
                                  >
                                    {member?.role ===
                                    "Creator" ? null : member?.role ===
                                      "Admin" ? (
                                      <UserRoundCog className="h-4 w-4 mr-1" />
                                    ) : member?.role === "Editor" ? (
                                      <Pencil className="h-4 w-4 mr-1" />
                                    ) : member?.role === "Viewer" ? (
                                      <Eye className="h-4 w-4 mr-1" />
                                    ) : null}
                                    {member?.role}
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className="w-40">
                                    <DropdownMenuGroup>
                                      <DropdownMenuRadioGroup
                                        value={member.role}
                                        onValueChange={(value) => {
                                          handleChangeMemberRole(
                                            member.id,
                                            value,
                                          );
                                        }}
                                      >
                                        <DropdownMenuRadioItem value="Admin">
                                          <UserRoundCog strokeWidth={1.5} />
                                          Admin
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="Editor">
                                          <Pencil strokeWidth={1.5} />
                                          Editor
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="Viewer">
                                          <Eye strokeWidth={1.5} />
                                          Viewer
                                        </DropdownMenuRadioItem>
                                      </DropdownMenuRadioGroup>

                                      <DropdownMenuSeparator />

                                      <DropdownMenuItem
                                        variant="destructive"
                                        onClick={() =>
                                          handleRemoveMember(member.id)
                                        }
                                      >
                                        <Trash2 strokeWidth={1.5} />
                                        Remove
                                      </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              ) : (
                                <Button
                                  variant="secondary"
                                  disabled
                                  className="ml-auto"
                                >
                                  Creator
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </FieldGroup>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ) : null}

            <Button
              variant="destructive"
              size="lg"
              className="flex items-center gap-2 py-5!"
              onClick={() => setDeletePopupOpen(true)}
            >
              <Trash2 /> Delete list
            </Button>
          </div>

          <DialogFooter>
            <DialogClose>Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster position="top-center" />
      
      <ConfirmationPopup
        open={deletePopupOpen}
        setOpen={setDeletePopupOpen}
        title="Delete list"
        message="Are you sure you want to delete this list?"
        destructive={true}
        confirmText="Delete list"
        cancelText="Cancel"
        onConfirm={handleDeleteList}
      />
      <ConfirmationPopup
        open={markPrivatePopupOpen}
        setOpen={setMarkPrivatePopupOpen}
        title="Mark list as private"
        message="Are you sure you want to make this list private? This will remove all other members and their roles from the list."
        destructive={true}
        confirmText="Set private"
        cancelText="Cancel"
        onConfirm={() => handleChangePrivacy("Private")}
      />
    </div>
  );
}

export default SingularListPane;
