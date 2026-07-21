"use client";

import { useState } from "react";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Calendar, CircleCheck, MapPin, RefreshCw, Search } from "lucide-react";

interface VisitedPlace {
  id: string;
  name: string;
  imageURL: string;
  address: string;
  visited: boolean;
  visitedAt: Date | null;
}

function VisitedPlaces({
  visitedPlaces,
  refreshVisitedPlaces,
  handleVisitedToggle,
}: {
  visitedPlaces: VisitedPlace[];
  refreshVisitedPlaces: () => void;
  handleVisitedToggle: (placeID: string) => Promise<void>;
}) {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const numberOfVisitedPlaces = visitedPlaces.filter(
    (place) => place.visited,
  ).length;

  const filteredVisitedPlaces = visitedPlaces.filter((place) => {
    const query = searchQuery.toLowerCase();

    return (
      place.name.toLowerCase().includes(query) ||
      place.address.toLowerCase().includes(query)
    );
  });

  return (
    <>
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center gap-2">
          <p className="font-bold text-sm">{numberOfVisitedPlaces} visited</p>
          <RefreshCw
            className="w-3.5 h-3.5 cursor-pointer"
            onClick={() => {
              refreshVisitedPlaces();
            }}
          />
        </div>
        <InputGroup className="p-1 py-4 max-w-48">
          <InputGroupInput
            id="search-input"
            placeholder="Search visited..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <InputGroupAddon>
            <Search className="h-4 w-4" />
          </InputGroupAddon>
        </InputGroup>
      </div>

      {visitedPlaces.length === 0 ? (
        <p className="mt-2 text-center text-sm text-muted-foreground">
          You haven&apos;t marked any places as visited yet. Start exploring the
          map and mark locations as visited to see them here!
        </p>
      ) : (
        <div className="grid grid-cols gap-4">
          {filteredVisitedPlaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 mt-2">
              <p className="text-sm">
                No visited places found that match your search query.
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
            filteredVisitedPlaces.map((place) => (
              <div
                key={place.id}
                className="flex flex-row border border-border rounded-md shadow-sm hover:scale-103 transition-transform duration-200 cursor-default"
              >
                <div className="relative w-35 h-30 shrink-0">
                  <Image
                    src={place.imageURL}
                    alt={place.name}
                    fill
                    sizes="150px"
                    className="w-full h-full object-cover rounded-l-md"
                  />
                </div>

                <div className="p-4">
                  <h3 className="font-bold mb-2">{place.name}</h3>
                  <div className="flex items-start gap-1.5 text-muted-foreground text-sm mb-1">
                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <p className="font-semibold break-all">{place.address}</p>
                  </div>
                  <div
                    className="flex items-center gap-1.5 text-muted-foreground text-sm"
                    {...(place.visitedAt && {
                      title: `Visited at ${new Date(place.visitedAt).toLocaleString()}`,
                    })}
                  >
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <p>
                      {place.visitedAt === null
                        ? "Unknown"
                        : new Date(place.visitedAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end pl-4 pr-8 ml-auto">
                  <CircleCheck
                    className={`h-7 w-7 cursor-pointer hover:scale-110 transition-all ${place.visited ? "stroke-primary" : "fill-none stroke-current"}`}
                    onClick={() => handleVisitedToggle(place.id)}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}

export default VisitedPlaces;
