"use client";

import { useEffect, useState } from "react";

import { getImageURL } from "@/lib/images";

import FullScreenImage from "@/components/map/panes/FullScreenImage";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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
  const [loading, setLoading] = useState<boolean>(true);
  const [fullScreenImageOpen, setFullScreenImageOpen] = useState(false);

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
        setLoading(false);
      } catch (error) {
        console.error("Error fetching place data:", error);
      }
    };

    fetchFullPaneData();
  }, [placeID]);

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

        <p className="font-medium text-muted-foreground">
          {placeData?.description}
        </p>

        <div className="grid grid-rows-2 gap-4">
          <div></div>
          {placeData?.visitedAt && (
            <div className="flex flex-row items-center gap-2">
              <Calendar />
              <div>
                <p>Visited on</p>
                <p>{new Date(placeData.visitedAt).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {fullScreenImageOpen ? (
        <FullScreenImage
          images={placeData?.images}
          placeName={placeData?.name}
          onClose={() => setFullScreenImageOpen(false)}
        />
      ) : null}

      <Toaster position="top-center" />
    </>
  );
}

export default PlacePane;
