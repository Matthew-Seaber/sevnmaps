import { useCallback, useEffect, useState } from "react";

import VisitedPlaces from "./VisitedPlaces";
import VisitedCountries from "./VisitedCountries";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Calendar, CircleCheck, MapPin } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

interface VisitedPlace {
  id: string;
  name: string;
  imageURL: string;
  address: string;
  visited: boolean;
  visitedAt: Date;
}

interface VisitedCountry {
  countryCode: string;
  name: string;
  flag: string;
  placesVisited: number;
  lastVisitedAt: Date;
}

function VisitedPane() {
  const [section, setSection] = useState<"all" | "countries" | "places">("all");
  const [visitedPlaces, setVisitedPlaces] = useState<VisitedPlace[]>([]);
  const [visitedCountries, setVisitedCountries] = useState<VisitedCountry[]>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(true);

  const fetchVisitedPlaces = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/places/visited/get_visited");

      if (!response.ok) {
        console.error("Failed to fetch visited places:", response.statusText);
        return;
      }

      const data = await response.json();
      console.log(data.visitedPlaces);
      setVisitedPlaces(data.visitedPlaces);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching visited places:", error);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await fetchVisitedPlaces();
    };

    fetchData();
  }, [fetchVisitedPlaces]);

  async function handleVisitedToggle(placeID: string) {
    setVisitedPlaces((prevPlaces) =>
      prevPlaces.map((place) =>
        place.id === placeID ? { ...place, visited: !place.visited } : place,
      ),
    );

    const response = await fetch("/api/places/visited/toggle_visited", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        placeId: placeID,
        visited: !visitedPlaces.find((place) => place.id === placeID),
      }),
    });

    if (!response.ok) {
      console.error("Failed to toggle visited:", response.statusText);
      toast.error("Failed to toggle visited. Please try again.");

      setVisitedPlaces((prevPlaces) =>
        prevPlaces.map((place) =>
          place.id === placeID ? { ...place, visited: !place.visited } : place,
        ),
      );

      return;
    }
  }

  return (
    <div className="flex flex-col gap-6 mt-4">
      <h1 className="text-2xl font-semibold mb-2">Visited</h1>

      <div className="flex flex-row items-center gap-2">
        <Badge
          variant={`${section === "all" ? "default" : "outline"}`}
          className="p-3 cursor-pointer"
          onClick={() => setSection("all")}
        >
          All
        </Badge>
        <Badge
          variant={`${section === "countries" ? "default" : "outline"}`}
          className="p-3 cursor-pointer"
          onClick={() => setSection("countries")}
        >
          Countries
        </Badge>
        <Badge
          variant={`${section === "places" ? "default" : "outline"}`}
          className="p-3 cursor-pointer"
          onClick={() => setSection("places")}
        >
          Places
        </Badge>
      </div>

      {loading ? (
        <div className="flex flex-row items-center gap-2">
          <Spinner />
          <p className="text-sm">Loading...</p>
        </div>
      ) : (
        <>
          {section === "all" && (
            <div className="flex flex-col gap-4">
              <div></div>
              <div>
                <div className="flex flex-row items-center justify-between">
                  <p className="font-bold text-sm">Recently visited</p>
                  <Button variant="link" className="cursor-pointer font-semibold">
                    See all
                  </Button>
                </div>
              </div>
            </div>
          )}
          {section === "places" && (
            <VisitedPlaces
              visitedPlaces={visitedPlaces}
              refreshVisitedPlaces={fetchVisitedPlaces}
              handleVisitedToggle={handleVisitedToggle}
            />
          )}
          {section === "countries" && (
            <VisitedCountries visitedCountries={visitedCountries} />
          )}
        </>
      )}

      <Toaster position="top-center" />
    </div>
  );
}

export default VisitedPane;
