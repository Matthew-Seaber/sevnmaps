"use client";

import { useEffect, useState } from "react";

import { getImageURL } from "@/lib/images";
import { useInfoPane } from "@/components/map/InfoPaneContext";

import FullScreenImage from "@/components/map/panes/FullScreenImage";
import { listIcons } from "@/components/map/ListIcons";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  MapPin,
  Images,
  Bookmark,
  Heart,
  CircleCheck,
  Share2,
  Calendar,
  Tag,
  Copy,
  Notebook,
  Binoculars,
  Search,
  Map,
  EllipsisVertical,
  CircleUserRound,
  Star,
  Pencil,
  Check,
  CirclePlus,
  Flag,
} from "lucide-react";

const MAP_PLACE_UPDATED_EVENT = "map:place-updated";

interface Photo {
  id: string;
  imageURL: string;
  uploadedAt: Date;
  uploadedBy: string;
  primaryImage: boolean;
  source: "place" | "review";
  reviewID?: string;
}

interface Review {
  id: string;
  username: string | null;
  profilePictureURL: string | null;
  createdAt: Date;
  stars: number;
  comment: string | null;
  images: Photo[];
}

interface List {
  id: string;
  listName: string;
  listColor: string;
  listIcon: string | null;
}

interface Place {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  country: string;
  state: string | null;
  zipCode: string | null;
  city: string | null;
  mainAddress: string | null;

  favorited: boolean;
  visited: boolean;
  visitedAt: Date | null;
  privateNote: string | null;

  tags: string[];
  lists: string[];
  images: Photo[];
  reviews: Review[];
}

type MapPlaceUpdatedEventDetail = {
  placeId: string;
  favorite?: boolean;
  visited?: boolean;
  inList?: boolean;
};

type ListSidebarEventDetail = {
  action: "deleted" | "updated" | "added";
  listID: string;
  newListName?: string;
  newListColor?: string;
  newPlaceCountChange?: number;
};

const LIST_SIDEBAR_EVENT = "sevnmaps:list-sidebar-updated";

function notifySidebarListUpdated(
  listID: string,
  newListName?: string,
  newListColor?: string,
  newPlaceCountChange?: number,
) {
  window.dispatchEvent(
    new CustomEvent<ListSidebarEventDetail>(LIST_SIDEBAR_EVENT, {
      detail: {
        action: "updated",
        listID,
        newListName,
        newListColor,
        newPlaceCountChange,
      },
    }),
  );
}

function PlacePane({ placeID }: { placeID: string; fullBleedImage?: boolean }) {
  const [placeData, setPlaceData] = useState<Place | null>(null);
  const [listData, setListData] = useState<List[] | null>(null);
  const [privateNote, setPrivateNote] = useState<string | null>(null);
  const [reviewSearchQuery, setReviewSearchQuery] = useState<string>("");
  const [addToListDialogOpen, setAddToListDialogOpen] = useState(false);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [privateNoteDialogOpen, setPrivateNoteDialogOpen] = useState(false);
  const [createReviewDialogOpen, setCreateReviewDialogOpen] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState<boolean>(false);
  const [reviewStars, setReviewStars] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [fullScreenImageOpen, setFullScreenImageOpen] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  const { openPane, closePane } = useInfoPane();

  const emitMapPlaceUpdate = (detail: MapPlaceUpdatedEventDetail) => {
    window.dispatchEvent(
      new CustomEvent<MapPlaceUpdatedEventDetail>(MAP_PLACE_UPDATED_EVENT, {
        detail,
      }),
    );
  };

  useEffect(() => {
    const fetchFullPaneData = async () => {
      try {
        const response = await fetch(
          `/api/places/fetch_full_data?placeID=${placeID}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch place data");
        }

        const data = await response.json();

        setPlaceData(data.place);
        setListData(data.lists);
        setUserHasReviewed(data.userHasReviewed);
        setPrivateNote(data.place.privateNote);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching place data:", error);
      }
    };

    fetchFullPaneData();
  }, [placeID]);

  const filteredReviews =
    placeData?.reviews.filter((review) => {
      const query = reviewSearchQuery.toLowerCase();

      return review.comment?.toLowerCase().includes(query);
    }) ?? [];

  async function handleFavoriteToggle() {
    if (!placeData) return;

    const newFavorite = !placeData.favorited;

    setPlaceData((prevPlaceData) =>
      prevPlaceData
        ? { ...prevPlaceData, favorited: !prevPlaceData.favorited }
        : prevPlaceData,
    );

    emitMapPlaceUpdate({ placeId: placeID, favorite: newFavorite });

    const response = await fetch("/api/places/favorites/toggle_favorite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        placeId: placeID,
        favorite: newFavorite,
      }),
    });

    if (!response.ok) {
      console.error("Failed to toggle favorite:", response.statusText);
      toast.error("Failed to toggle favourite. Please try again.");

      setPlaceData((prevPlaceData) =>
        prevPlaceData
          ? { ...prevPlaceData, favorited: !prevPlaceData.favorited }
          : prevPlaceData,
      );

      emitMapPlaceUpdate({ placeId: placeID, favorite: !newFavorite });

      return;
    }
  }

  async function handleVisitedToggle() {
    setPlaceData((prevPlaceData) =>
      prevPlaceData
        ? { ...prevPlaceData, visited: !prevPlaceData.visited }
        : prevPlaceData,
    );

    const response = await fetch("/api/places/visited/toggle_visited", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        placeId: placeID,
        visited: !placeData?.visited,
        visitedAt: null,
      }),
    });

    if (!response.ok) {
      console.error("Failed to toggle visited:", response.statusText);
      toast.error("Failed to toggle visited. Please try again.");

      setPlaceData((prevPlaceData) =>
        prevPlaceData
          ? { ...prevPlaceData, visited: !prevPlaceData.visited }
          : prevPlaceData,
      );

      return;
    }
  }

  async function handleEditPrivateNote() {
    const response = await fetch("/api/places/edit_private_note", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        placeId: placeID,
        privateNote: privateNote,
      }),
    });

    if (!response.ok) {
      console.error("Failed to edit private note:", response.statusText);
      toast.error("Failed to edit private note. Please try again.");

      return;
    }

    setPlaceData((prevPlaceData) =>
      prevPlaceData
        ? { ...prevPlaceData, privateNote: privateNote }
        : prevPlaceData,
    );

    toast.success("Private note successfully updated!");
    setPrivateNoteDialogOpen(false);
  }

  async function handleCreateReview() {
    if (reviewStars < 1 || reviewStars > 5) {
      toast.info("Please select a star rating from 1 to 5.");
      return;
    }

    const response = await fetch("/api/places/reviews/create_review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        placeId: placeID,
        stars: reviewStars,
        comment: reviewComment,
      }),
    });

    if (!response.ok) {
      console.error("Failed to post review:", response.statusText);
      toast.error("Failed to post review. Please try again later.");

      return;
    }

    toast.success("Review posted!");
    setCreateReviewDialogOpen(false);

    closePane();
    setTimeout(() => {
      openPane({ type: "place", placeID: placeID });
    }, 50);
  }

  async function handleAddPlaceToList(listId: string) {
    if (!placeData) return;

    const previousInList = placeData.lists.length > 0;

    setPlaceData((prevPlaceData) =>
      prevPlaceData
        ? { ...prevPlaceData, lists: [...prevPlaceData.lists, listId] }
        : prevPlaceData,
    );

    emitMapPlaceUpdate({ placeId: placeID, inList: true });

    const response = await fetch("/api/lists/add_place", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        listID: listId,
        placeID: placeID,
      }),
    });

    if (!response.ok) {
      console.error("Failed to add place to list:", response.statusText);

      if (response.status === 403) {
        toast.info(
          "You have reached the maximum number of places allowed per list under your (or the list owner's) subscription plan.",
        );
      } else {
        toast.error("Failed to add place to list. Please try again later.");
      }

      setPlaceData((prevPlaceData) =>
        prevPlaceData
          ? {
              ...prevPlaceData,
              lists: prevPlaceData.lists.filter((id) => id !== listId),
            }
          : prevPlaceData,
      );

      emitMapPlaceUpdate({ placeId: placeID, inList: previousInList });

      return;
    }

    const listName = listData?.find((list) => list.id === listId)?.listName;

    notifySidebarListUpdated(listId, undefined, undefined, 1);

    toast.success(
      `${placeData?.name} added to your list${listName ? ` '${listName}'` : ""}!`,
    );
  }

  async function handleRemovePlaceFromList(listId: string) {
    if (!placeData) return;

    const previousInList = placeData.lists.length > 0;
    const nextInList = placeData.lists.filter((id) => id !== listId).length > 0;

    setPlaceData((prevPlaceData) =>
      prevPlaceData
        ? {
            ...prevPlaceData,
            lists: prevPlaceData.lists.filter((id) => id !== listId),
          }
        : prevPlaceData,
    );

    emitMapPlaceUpdate({ placeId: placeID, inList: nextInList });

    const response = await fetch("/api/lists/remove_place", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        listID: listId,
        placeID: placeID,
      }),
    });

    if (!response.ok) {
      console.error("Failed to remove place from list:", response.statusText);
      toast.error("Failed to remove place from list. Please try again later.");

      setPlaceData((prevPlaceData) =>
        prevPlaceData
          ? { ...prevPlaceData, lists: [...prevPlaceData.lists, listId] }
          : prevPlaceData,
      );

      emitMapPlaceUpdate({ placeId: placeID, inList: previousInList });

      return;
    }

    const listName = listData?.find((list) => list.id === listId)?.listName;

    notifySidebarListUpdated(listId, undefined, undefined, -1);

    toast.success(
      `${placeData?.name} removed from your list${listName ? ` '${listName}'` : ""}.`,
    );
  }

  function formatCoordinates() {
    if (!placeData) return "";

    const latitude = placeData.latitude;
    const longitude = placeData.longitude;

    const latitudeDirection = latitude >= 0 ? "N" : "S";
    const longitudeDirection = longitude >= 0 ? "E" : "W";

    const formattedLatitude = `${Math.abs(latitude).toFixed(4)}° ${latitudeDirection}`;
    const formattedLongitude = `${Math.abs(longitude).toFixed(4)}° ${longitudeDirection}`;

    return `${formattedLatitude}, ${formattedLongitude}`;
  }

  function calculateAverageRating() {
    if (!placeData || placeData.reviews.length === 0) return 0;

    const totalStars = placeData.reviews.reduce(
      (sum, review) => sum + review.stars,
      0,
    );

    return totalStars / placeData.reviews.length;
  }

  function copyAddress() {
    if (!placeData) return;

    const fullAddress = `${placeData.mainAddress || ""}, ${placeData.city || ""}, ${placeData.state || ""}, ${placeData.country || ""}, ${placeData.zipCode || ""}`;

    navigator.clipboard
      .writeText(fullAddress)
      .then(() => {
        toast.success("Copied address to clipboard!");
        setAddressDialogOpen(false);
      })
      .catch((error) => {
        console.error("Failed to copy address:", error);

        toast.error("Failed to copy address. Please try again later.");
      });
  }

  function handleShare() {
    if (!placeData) return;

    const shareLink = `${window.location.origin}/map/place/${placeData.id}`;

    navigator.clipboard
      .writeText(shareLink)
      .then(() => {
        toast.success("Copied place link to clipboard!");
        setShareSuccess(true);
        setTimeout(() => {
          setShareSuccess(false);
        }, 2000);
      })
      .catch((error) => {
        console.error("Failed to copy share link:", error);

        toast.error("Failed to copy place link. Please try again later.");
      });
  }

  return loading ? (
    <div className="mt-6 flex flex-row items-center gap-2">
      <Spinner />
      <p>Loading...</p>
    </div>
  ) : !placeData || !listData ? (
    <p>Failed to load place information.</p>
  ) : (
    <>
      <div
        onClick={() => setFullScreenImageOpen(true)}
        className="group relative -mt-6 -mx-6 w-[calc(100%+3rem)] aspect-square shrink-0 overflow-hidden cursor-pointer [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_85%,transparent_100%)]"
      >
        <div className="absolute inset-0">
          <Image
            src={getImageURL(
              placeData?.images[0]?.imageURL,
              !placeData?.images[0]?.imageURL,
            )}
            alt={`Image of ${placeData?.name}`}
            fill
            sizes="400px"
            draggable={false}
            loading="eager"
            className="object-cover rounded-b-md"
          />
        </div>

        <div className="absolute top-8 left-8 flex flex-row items-center gap-2 p-2 bg-accent hover:bg-accent/80 rounded-md opacity-0 group-hover:opacity-90 transition-opacity duration-200">
          <Images className="h-4 w-4" />
          <p className="text-sm">See more</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 py-4 md:px-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-bold text-xl">{placeData?.name}</h1>
          <div className="flex flex-row items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <p className="font-medium text-sm">
              {placeData?.mainAddress}, {placeData?.city},{" "}
              {!placeData?.city ? placeData?.state : ""} {placeData?.country}
            </p>
          </div>
        </div>

        <div className="flex flex-row items-center gap-3 justify-between">
          <div className="flex flex-row items-center gap-2">
            <Button
              variant="outline"
              className="flex flex-row items-center gap-2 p-5"
              onClick={() => setAddToListDialogOpen(true)}
            >
              <Bookmark
                className={`h-7 w-7 cursor-pointer hover:scale-110 transition-all ${placeData?.lists.length > 0 ? "fill-blue-500 stroke-blue-500" : "fill-none stroke-current"}`}
              />
              Add{placeData?.lists.length > 0 && `ed`} to list
            </Button>

            <Button
              variant="outline"
              onClick={handleFavoriteToggle}
              className="p-5"
            >
              <Heart
                className={`h-7 w-7 cursor-pointer hover:scale-110 transition-all ${placeData?.favorited ? "fill-red-500 stroke-red-500" : "fill-none stroke-current"}`}
              />
            </Button>

            <Button
              variant="outline"
              onClick={handleVisitedToggle}
              className="p-5"
            >
              <CircleCheck
                strokeWidth={2.75}
                className={`h-7 w-7 cursor-pointer hover:scale-110 transition-all ${placeData?.visited ? "stroke-primary" : "stroke-current"}`}
              />
            </Button>
          </div>

          <Button variant="outline" onClick={handleShare} className="p-5">
            {shareSuccess ? <Check /> : <Share2 className="h-7 w-7" />}
          </Button>
        </div>

        <p className="mb-4 font-medium text-muted-foreground">
          {placeData?.description}
        </p>

        <div className="grid grid-cols-1 min-[440px]:grid-cols-2 gap-4">
          <div className="flex flex-row items-center gap-4">
            <Tag className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex flex-col gap-0.5 text-sm">
              <p className="font-medium text-muted-foreground">Tags</p>
              <p className="font-semibold">
                {placeData?.tags.length > 0
                  ? placeData?.tags.join(", ")
                  : "None"}
              </p>
            </div>
          </div>

          <div className="flex flex-row items-center gap-4">
            <Binoculars className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex flex-col gap-0.5 text-sm">
              <p className="font-medium text-muted-foreground">Coordinates</p>
              <p className="font-semibold">{formatCoordinates() || "N/A"}</p>
            </div>
          </div>

          {placeData?.visitedAt && (
            <div className="flex flex-row items-center gap-4">
              <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex flex-col gap-0.5 text-sm">
                <p className="font-medium text-muted-foreground">Visited on</p>
                <p className="font-semibold">
                  {new Date(placeData.visitedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-row items-center gap-4">
            <Map className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex flex-col gap-0.5 text-sm">
              <p className="font-medium text-muted-foreground">Address</p>
              <Button
                variant="link"
                onClick={() => setAddressDialogOpen(true)}
                className="p-0 font-semibold cursor-pointer"
              >
                Click for full address
              </Button>
            </div>
          </div>

          <div className="flex flex-row items-center gap-4">
            <Notebook className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex flex-col gap-0.5 text-sm">
              <p className="font-medium text-muted-foreground">Private note</p>
              <Button
                variant="link"
                onClick={() => setPrivateNoteDialogOpen(true)}
                className="p-0 font-semibold cursor-pointer"
              >
                Click to {placeData?.privateNote ? "view" : "add"} note
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-row items-center justify-between gap-2">
          <h3 className="font-semibold text-lg">Reviews</h3>

          <InputGroup className="p-1 py-4 max-w-48">
            <InputGroupInput
              id="search-input"
              placeholder="Search reviews..."
              value={reviewSearchQuery}
              onChange={(e) => setReviewSearchQuery(e.target.value)}
            />
            <InputGroupAddon>
              <Search className="h-4 w-4" />
            </InputGroupAddon>
          </InputGroup>
        </div>

        {placeData?.reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="mt-2 text-sm text-muted-foreground">
              There are no currently no reviews for {placeData?.name}. You can
              be the first to add one!
            </p>

            <Button
              className="flex flex-row gap-1 py-5 px-4"
              onClick={() => setCreateReviewDialogOpen(true)}
            >
              <Pencil />
              Write a review
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-row items-center justify-between gap-2 mb-2">
              <div className="p-2 flex flex-col items-center justify-center gap-1">
                <h2 className="font-semibold text-3xl">
                  {calculateAverageRating().toFixed(1)}
                </h2>

                <div className="flex flex-row items-center gap-0.5">
                  <Star
                    strokeWidth={1.5}
                    className={`w-6 h-6 ${calculateAverageRating() >= 1 ? "fill-yellow-400 stroke-yellow-400" : "stroke-slate-500"}`}
                  />
                  <Star
                    strokeWidth={1.5}
                    className={`w-6 h-6 ${calculateAverageRating() >= 2 ? "fill-yellow-400 stroke-yellow-400" : "stroke-slate-500"}`}
                  />
                  <Star
                    strokeWidth={1.5}
                    className={`w-6 h-6 ${calculateAverageRating() >= 3 ? "fill-yellow-400 stroke-yellow-400" : "stroke-slate-500"}`}
                  />
                  <Star
                    strokeWidth={1.5}
                    className={`w-6 h-6 ${calculateAverageRating() >= 4 ? "fill-yellow-400 stroke-yellow-400" : "stroke-slate-500"}`}
                  />
                  <Star
                    strokeWidth={1.5}
                    className={`w-6 h-6 ${calculateAverageRating() >= 5 ? "fill-yellow-400 stroke-yellow-400" : "stroke-slate-500"}`}
                  />
                </div>

                <p className="text-sm text-muted-foreground">
                  {placeData.reviews.length} review
                  {placeData.reviews.length !== 1 ? "s" : ""}
                </p>
              </div>

              <Button
                className="flex flex-row gap-1 py-5 px-4"
                disabled={userHasReviewed}
                onClick={() => setCreateReviewDialogOpen(true)}
              >
                <Pencil />
                Write a review
              </Button>
            </div>

            {filteredReviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 mt-2">
                <p className="text-sm">
                  No reviews found that match your search query.
                </p>
                <Button
                  size="lg"
                  className="p-4"
                  onClick={() => setReviewSearchQuery("")}
                >
                  Clear search
                </Button>
              </div>
            ) : (
              filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className="flex flex-col gap-2 border border-border rounded-md p-4"
                >
                  <div className="flex flex-row items-center justify-between gap-2">
                    <div className="flex flex-row items-center gap-2">
                      {review.profilePictureURL ? (
                        <Image
                          src={review.profilePictureURL}
                          alt="Reviewer's profile picture"
                          width={6}
                          height={6}
                          sizes="24px"
                          className="w-7 h-7 rounded-full"
                        />
                      ) : (
                        <CircleUserRound
                          strokeWidth={1.5}
                          className="w-7 h-7 bg-primary text-primary-foreground rounded-full"
                        />
                      )}

                      <div className="flex flex-col items-start gap-0.5">
                        <p className="font-semibold text-sm">
                          @{review.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger onClick={(e) => e.stopPropagation()}>
                        <div className="hover:bg-muted rounded-full p-2">
                          <EllipsisVertical className="w-5 h-5" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <p
                            onClick={() => window.open("/contact", "_blank")}
                            className="w-full"
                          >
                            Report review
                          </p>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {review.images.length > 0 && (
                    <Image src={review.images[0].imageURL} alt="Review image" />
                  )}

                  <div className="flex flex-row items-center gap-1">
                    <Star
                      strokeWidth={1.5}
                      className={`w-5 h-5 ${review.stars >= 1 ? "fill-yellow-400 stroke-yellow-400" : "stroke-slate-500"}`}
                    />
                    <Star
                      strokeWidth={1.5}
                      className={`w-5 h-5 ${review.stars >= 2 ? "fill-yellow-400 stroke-yellow-400" : "stroke-slate-500"}`}
                    />
                    <Star
                      strokeWidth={1.5}
                      className={`w-5 h-5 ${review.stars >= 3 ? "fill-yellow-400 stroke-yellow-400" : "stroke-slate-500"}`}
                    />
                    <Star
                      strokeWidth={1.5}
                      className={`w-5 h-5 ${review.stars >= 4 ? "fill-yellow-400 stroke-yellow-400" : "stroke-slate-500"}`}
                    />
                    <Star
                      strokeWidth={1.5}
                      className={`w-5 h-5 ${review.stars >= 5 ? "fill-yellow-400 stroke-yellow-400" : "stroke-slate-500"}`}
                    />
                  </div>

                  <p>{review.comment}</p>
                </div>
              ))
            )}
          </div>
        )}

        <Link
          href="/contact"
          className="mt-8 flex flex-row gap-1 items-center text-xs text-muted-foreground hover:underline hover:text-foreground"
        >
          <Flag className="h-3 w-3" />
          Report an issue with this place.
        </Link>
      </div>

      {fullScreenImageOpen ? (
        <FullScreenImage
          images={placeData?.images}
          placeName={placeData?.name}
          onClose={() => setFullScreenImageOpen(false)}
        />
      ) : null}

      <Dialog open={addToListDialogOpen} onOpenChange={setAddToListDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add {placeData?.name} to a list</DialogTitle>
            <DialogDescription>
              Only lists which you own or are an editor/admin of are shown
              below.
            </DialogDescription>
          </DialogHeader>

          {listData?.length === 0 ? (
            <p>You currently have no lists.</p>
          ) : (
            <div className="flex flex-col items-center gap-0.5">
              {listData?.map((list) => {
                const ListIconComponent = listIcons.find(
                  (icon) => icon.id === list.listIcon,
                )?.icon;

                return (
                  <div
                    key={list.id}
                    className="group w-full flex flex-row items-center justify-between gap-2 rounded-md p-2 hover:bg-accent cursor-pointer"
                    onClick={() => {
                      if (placeData?.lists.includes(list.id)) {
                        handleRemovePlaceFromList(list.id);
                      } else {
                        handleAddPlaceToList(list.id);
                      }
                    }}
                  >
                    <div className="flex flex-row items-center gap-2">
                      {ListIconComponent ? (
                        <ListIconComponent
                          className="h-8 w-8 text-accent rounded-sm p-1"
                          strokeWidth={1.5}
                          style={{ backgroundColor: `#${list.listColor}` }}
                        />
                      ) : (
                        <span
                          className="inline-block w-8 h-8 rounded-sm"
                          style={{ backgroundColor: `#${list.listColor}` }}
                        />
                      )}

                      <h3 className="font-semibold">{list.listName}</h3>
                    </div>

                    {placeData?.lists.includes(list.id) ? (
                      <CircleCheck className="h-8 w-8 fill-primary stroke-background" />
                    ) : (
                      <CirclePlus className="hidden group-hover:flex mr-1 h-6 w-6 stroke-slate-600" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <DialogFooter>
            <DialogClose>Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Full address</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col font-medium">
            <p>{placeData?.mainAddress}</p>
            <p>{placeData?.city}</p>
            <p>{placeData?.state}</p>
            <p>{placeData?.country}</p>
            <p>{placeData?.zipCode}</p>
          </div>

          <Button
            variant="default"
            onClick={copyAddress}
            className="flex flex-row gap-2"
          >
            <Copy />
            Copy address
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog
        open={privateNoteDialogOpen}
        onOpenChange={setPrivateNoteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Private note</DialogTitle>
          </DialogHeader>

          <Textarea
            placeholder="Enter a private note here..."
            value={privateNote || ""}
            onChange={(e) => setPrivateNote(e.target.value)}
          />

          <Button
            variant="default"
            onClick={handleEditPrivateNote}
            className="flex flex-row gap-2"
          >
            Save
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog
        open={createReviewDialogOpen}
        onOpenChange={setCreateReviewDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Write a review</DialogTitle>
          </DialogHeader>

          <div className="flex flex-row items-center gap-1 pt-1 pl-2">
            <Star
              strokeWidth={1.5}
              className={`w-7 h-7 cursor-pointer ${reviewStars >= 1 ? "fill-yellow-400 stroke-yellow-400" : "fill-none stroke-slate-500"}`}
              onClick={() => setReviewStars(1)}
            />
            <Star
              strokeWidth={1.5}
              className={`w-7 h-7 cursor-pointer ${reviewStars >= 2 ? "fill-yellow-400 stroke-yellow-400" : "fill-none stroke-slate-500"}`}
              onClick={() => setReviewStars(2)}
            />
            <Star
              strokeWidth={1.5}
              className={`w-7 h-7 cursor-pointer ${reviewStars >= 3 ? "fill-yellow-400 stroke-yellow-400" : "fill-none stroke-slate-500"}`}
              onClick={() => setReviewStars(3)}
            />
            <Star
              strokeWidth={1.5}
              className={`w-7 h-7 cursor-pointer ${reviewStars >= 4 ? "fill-yellow-400 stroke-yellow-400" : "fill-none stroke-slate-500"}`}
              onClick={() => setReviewStars(4)}
            />
            <Star
              strokeWidth={1.5}
              className={`w-7 h-7 cursor-pointer ${reviewStars >= 5 ? "fill-yellow-400 stroke-yellow-400" : "fill-none stroke-slate-500"}`}
              onClick={() => setReviewStars(5)}
            />
          </div>

          <Textarea
            placeholder="Share your thoughts about this place..."
            value={reviewComment || ""}
            onChange={(e) => setReviewComment(e.target.value)}
            className="min-h-24"
          />

          <DialogFooter>
            <DialogClose>Close</DialogClose>

            <Button
              variant="default"
              onClick={handleCreateReview}
              className="flex flex-row gap-2 md:ml-2 sm:px-4"
            >
              Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster position="top-center" />
    </>
  );
}

export default PlacePane;
