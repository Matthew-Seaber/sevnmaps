"use client";

import { useEffect, useState } from "react";

import { getImageURL } from "@/lib/images";

import FullScreenImage from "@/components/map/panes/FullScreenImage";

import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { MapPin, Images } from "lucide-react";

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

  return loading ? (
    <div className="mt-6 flex flex-row items-center gap-2">
      <Spinner />
      <p>Loading...</p>
    </div>
  ) : !placeData || !listData ? (
    <p>Failed to load place information.</p>
  ) : (
    <>
      <div className="group relative -mt-6 -mx-6 w-[calc(100%+3rem)] aspect-square shrink-0 overflow-hidden [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_85%,transparent_100%)]">
        <Image
          src={getImageURL(
            placeData?.images[0]?.imageURL,
            !placeData?.images[0]?.imageURL,
          )}
          alt={`Image of ${placeData?.name}`}
          fill
          sizes="400px"
          draggable={false}
          className="object-cover rounded-b-md cursor-pointer"
        />

        <div className="absolute top-8 left-8 flex flex-row items-center gap-2 p-2 bg-accent hover:bg-accent/80 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
          <Images className="h-4 w-4" />
          <p className="text-sm">See more</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-4">
        <h1 className="font-bold text-xl">{placeData?.name}</h1>
        <div className="flex flex-row items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <p className="font-medium text-sm">
            {placeData?.mainAddress}, {placeData?.city},{" "}
            {!placeData?.city ? placeData?.state : ""} {placeData?.country}
          </p>
        </div>
      </div>

      <FullScreenImage images={placeData?.images} placeName={placeData?.name} />
    </>
  );
}

export default PlacePane;
