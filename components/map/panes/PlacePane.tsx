"use client";

import { useEffect, useState } from "react";

import { Spinner } from "@/components/ui/spinner";
import { MapPin } from "lucide-react";

interface Image {
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
  images: Image[];
}

interface List {
  id: string;
  listName: string;
  listDescription: string | null;
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
  images: Image[];
  reviews: Review[];
}

function PlacePane({ placeID }: { placeID: string }) {
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
  ) : (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="font-bold text-lg">{placeData?.name}</h1>
      <div className="flex flex-row items-center gap-2 text-muted-foreground">
        <MapPin />
        <p>
          {placeData?.mainAddress}, {placeData?.city}, {placeData?.state}{" "}
          {placeData?.country}
        </p>
      </div>
    </div>
  );
}

export default PlacePane;
