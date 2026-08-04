"use client";

import { useEffect, useState } from "react";

import { getImageURL } from "@/lib/images";

import FullScreenImage from "@/components/map/panes/FullScreenImage";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
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
} from "lucide-react";

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

function PlacePane({ placeID }: { placeID: string; fullBleedImage?: boolean }) {
  const [placeData, setPlaceData] = useState<Place | null>(null);
  const [listData, setListData] = useState<List[] | null>(null);
  const [privateNote, setPrivateNote] = useState<string | null>(null);
  const [reviewSearchQuery, setReviewSearchQuery] = useState<string>("");
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [privateNoteDialogOpen, setPrivateNoteDialogOpen] = useState(false);
  const [fullScreenImageOpen, setFullScreenImageOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

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
    setPlaceData((prevPlaceData) =>
      prevPlaceData
        ? { ...prevPlaceData, favorited: !prevPlaceData.favorited }
        : prevPlaceData,
    );

    const response = await fetch("/api/places/favorites/toggle_favorite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        placeId: placeID,
        favorite: !placeData?.favorited,
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
            className="object-cover rounded-b-md"
          />
        </div>

        <div className="absolute top-8 left-8 flex flex-row items-center gap-2 p-2 bg-accent hover:bg-accent/80 rounded-md opacity-0 group-hover:opacity-90 transition-opacity duration-200">
          <Images className="h-4 w-4" />
          <p className="text-sm">See more</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">
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

          <Button variant="outline" className="p-5">
            <Share2 className="h-7 w-7" />
          </Button>
        </div>

        <p className="mb-4 font-medium text-muted-foreground">
          {placeData?.description}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-row items-center gap-4">
            <Tag className="h-5 w-5 text-muted-foreground" />
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
            <Binoculars className="h-5 w-5 text-muted-foreground" />
            <div className="flex flex-col gap-0.5 text-sm">
              <p className="font-medium text-muted-foreground">Coordinates</p>
              <p className="font-semibold">{formatCoordinates() || "N/A"}</p>
            </div>
          </div>

          {placeData?.visitedAt && (
            <div className="flex flex-row items-center gap-4">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div className="flex flex-col gap-0.5 text-sm">
                <p className="font-medium text-muted-foreground">Visited on</p>
                <p className="font-semibold">
                  {new Date(placeData.visitedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-row items-center gap-4">
            <Map className="h-5 w-5 text-muted-foreground" />
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
            <Notebook className="h-5 w-5 text-muted-foreground" />
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
          <p className="mt-2 text-center text-sm text-muted-foreground">
            There are no currently no reviews for {placeData?.name}. You can be
            the first to add one!
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="p-2 flex flex-col items-center justify-center gap-1">
              <h2 className="text-xl">{calculateAverageRating().toFixed(1)}</h2>

              <div className="flex flex-row gap-0.5">
                <Star className="w-3 h-3" />
                {Math.round(calculateAverageRating()) === 2 ? (
                  <Star className="w-3 h-3" />
                ) : null}
                {Math.round(calculateAverageRating()) === 3 ? (
                  <Star className="w-3 h-3" />
                ) : null}
                {Math.round(calculateAverageRating()) === 4 ? (
                  <Star className="w-3 h-3" />
                ) : null}
                {Math.round(calculateAverageRating()) === 5 ? (
                  <Star className="w-3 h-3" />
                ) : null}
              </div>

              <p>
                {placeData.reviews.length} review
                {placeData.reviews.length !== 1 ? "s" : ""}
              </p>
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
                <div key={review.id} className="flex flex-col gap-2">
                  <div className="flex flex-row items-center justify-between gap-2">
                    <div>
                      {review.profilePictureURL ? (
                        <Image
                          src={review.profilePictureURL}
                          alt="Reviewer's profile picture"
                          className="w-4 h-4 rounded-full"
                        />
                      ) : (
                        <CircleUserRound
                          strokeWidth={1.5}
                          className="w-4 h-4 bg-primary text-primary-foreground rounded-full"
                        />
                      )}

                      <div className="flex flex-col items-center gap-0.5">
                        <p>@{review.username}</p>
                        <p className="text-xm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger onClick={(e) => e.stopPropagation()}>
                        <EllipsisVertical />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <Link href="/contact" target="_blank">
                            Report review
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {review.images.length > 0 && (
                    <Image src={review.images[0]} alt="Review image" />
                  )}

                  <div className="flex flex-row items-center gap-0.5">
                    <Star className="w-3 h-3" />
                    {review.stars === 2 ? <Star className="w-3 h-3" /> : null}
                    {review.stars === 3 ? <Star className="w-3 h-3" /> : null}
                    {review.stars === 4 ? <Star className="w-3 h-3" /> : null}
                    {review.stars === 5 ? <Star className="w-3 h-3" /> : null}
                  </div>

                  <p>{review.comment}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {fullScreenImageOpen ? (
        <FullScreenImage
          images={placeData?.images}
          placeName={placeData?.name}
          onClose={() => setFullScreenImageOpen(false)}
        />
      ) : null}

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

      <Toaster position="top-center" />
    </>
  );
}

export default PlacePane;
