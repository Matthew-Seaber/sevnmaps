import { useCallback, useEffect, useState } from "react";

import CountriesVisitedMap from "./CountriesVisitedMap";
import VisitedPlaces from "./VisitedPlaces";
import VisitedCountries from "./VisitedCountries";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Calendar as CalendarIcon,
  CalendarX2,
  CircleCheck,
  EllipsisVertical,
  MapPin,
  Pencil,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface VisitedPlace {
  id: string;
  name: string;
  imageURL: string;
  address: string;
  countryId: string;
  visited: boolean;
  visitedAt: Date | null;
}

interface VisitedCountry {
  id: string;
  countryCode: string;
  name: string;
  continent: string;
  description: string;
  flag: string;
  placesVisited: number;
  visitedAt: Date | null;
}

function VisitedPane() {
  const [section, setSection] = useState<"all" | "countries" | "places">("all");
  const [visitedPlaces, setVisitedPlaces] = useState<VisitedPlace[]>([]);
  const [visitedCountries, setVisitedCountries] = useState<VisitedCountry[]>(
    [],
  );
  const [selectedPlace, setSelectedPlace] = useState<VisitedPlace | null>(null);
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
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
      setVisitedPlaces(data.visitedPlaces);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching visited places:", error);
    }
  }, []);

  const fetchVisitedCountries = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/countries/fetch_visited_countries");

      if (!response.ok) {
        console.error(
          "Failed to fetch visited countries:",
          response.statusText,
        );
        return;
      }

      const data = await response.json();
      setVisitedCountries(data.visitedCountries);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching visited countries:", error);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await fetchVisitedPlaces();
      await fetchVisitedCountries();
    };

    fetchData();
  }, [fetchVisitedPlaces, fetchVisitedCountries]);

  const percentageCountriesVisited = visitedCountries.length;

  async function handleVisitedToggle(
    placeID: string,
    toggle: boolean,
    visited: boolean | null,
    visitedAt: Date | null,
  ) {
    if (!placeID) return;

    let newVisited: boolean;

    if (toggle) {
      const currentPlace = visitedPlaces.find((place) => place.id === placeID);
      if (!currentPlace) return;

      newVisited = !currentPlace.visited;

      setVisitedPlaces((prevPlaces) =>
        prevPlaces.map((place) =>
          place.id === placeID
            ? { ...place, visited: newVisited, visitedAt }
            : place,
        ),
      );
    } else {
      if (visited === null) return;

      newVisited = visited;
    }

    const response = await fetch("/api/places/visited/toggle_visited", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        placeId: placeID,
        visited: newVisited,
        visitedAt,
      }),
    });

    if (!response.ok) {
      console.error("Failed to toggle visited:", response.statusText);
      toast.error("Failed to toggle visited. Please try again.");

      if (toggle) {
        setVisitedPlaces((prevPlaces) =>
          prevPlaces.map((place) =>
            place.id === placeID
              ? { ...place, visited: !newVisited, visitedAt }
              : place,
          ),
        );
      }

      return;
    }

    if (!toggle) {
      if (visited === null) return;

      setVisitedPlaces((prevPlaces) =>
        prevPlaces.map((place) =>
          place.id === placeID ? { ...place, newVisited, visitedAt } : place,
        ),
      );
    }

    toast.success("Visited status updated!");
  }

  function locallyUpdateVisitedCountries(
    countryId: string,
    visitedAt: Date | null,
  ) {
    setVisitedCountries((prevCountries) =>
      prevCountries.map((country) =>
        country.id === countryId ? { ...country, visitedAt } : country,
      ),
    );
  }

  return (
    <div className="flex flex-col gap-6 mt-4">
      <h1 className="text-2xl font-semibold mb-2">Visited</h1>

      <div className="flex flex-row items-center gap-1.5">
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
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between border border-border rounded-md p-4 cursor-default">
                <div className="font-semibold">
                  <p className="mb-3 text-sm">You&apos;ve visited</p>

                  <div className="flex flex-row items-center gap-12">
                    <div>
                      <h3 className="text-3xl text-primary">
                        {visitedCountries.length}
                      </h3>
                      <p className="font-medium text-sm">
                        {visitedCountries.length === 1
                          ? "country"
                          : "countries"}
                      </p>
                    </div>

                    <Separator orientation="vertical" />

                    <div>
                      <h3 className="text-3xl text-primary">
                        {visitedPlaces.length}
                      </h3>
                      <p className="font-medium text-sm">
                        {visitedPlaces.length === 1 ? "place" : "places"}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="relative flex items-center justify-center h-20 w-20 rounded-full"
                  style={{
                    background: `conic-gradient(var(--primary) ${percentageCountriesVisited * 3.6}deg, var(--muted) 0deg)`,
                  }}
                >
                  <div className="bg-background flex items-center justify-center h-16 w-16 rounded-full font-semibold text-lg">
                    {percentageCountriesVisited.toFixed(1)}%
                  </div>
                </div>
              </div>

              <CountriesVisitedMap
                visitedCountries={visitedCountries}
                allowZoom={false}
              />

              <Separator />

              <div>
                <div className="flex flex-row items-center justify-between">
                  <p className="font-bold text-sm">Recently visited</p>
                  <Button
                    variant="link"
                    className="cursor-pointer font-semibold"
                    onClick={() => setSection("places")}
                  >
                    See all
                  </Button>
                </div>

                <div className="flex flex-col gap-4 mt-3">
                  {visitedPlaces.length === 0 ? (
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                      You haven&apos;t marked any places as visited yet. Start
                      exploring the map and mark locations as visited to see
                      them here!
                    </p>
                  ) : (
                    <>
                      {visitedPlaces.slice(0, 3).map((place) => (
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
                              <p className="font-semibold break-all">
                                {place.address}
                              </p>
                            </div>
                            <div
                              className="flex items-center gap-1.5 text-muted-foreground text-sm"
                              {...(place.visitedAt && {
                                title: `Visited at ${new Date(place.visitedAt).toLocaleString()}`,
                              })}
                            >
                              <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
                              <p>
                                {place.visitedAt === null
                                  ? "Unknown"
                                  : new Date(place.visitedAt).toLocaleString(
                                      undefined,
                                      {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      },
                                    )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-end pl-4 pr-8 ml-auto">
                            <div className="flex flex-row items-center gap-2">
                              <CircleCheck
                                className={`h-7 w-7 cursor-pointer hover:scale-110 transition-all ${place.visited ? "stroke-primary" : "fill-none stroke-current"}`}
                                onClick={() =>
                                  handleVisitedToggle(
                                    place.id,
                                    true,
                                    null,
                                    null,
                                  )
                                }
                              />

                              <DropdownMenu>
                                <DropdownMenuTrigger>
                                  <EllipsisVertical className="h-5 w-5 cursor-pointer hover:scale-110 transition-all text-muted-foreground" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-48">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedPlace(place);
                                      setDateDialogOpen(true);
                                    }}
                                  >
                                    <Pencil /> Edit visited date
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() => {
                                      handleVisitedToggle(
                                        place.id,
                                        false,
                                        true,
                                        null,
                                      );
                                    }}
                                  >
                                    <CalendarX2 /> Remove visited date
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      ))}

                      <Dialog
                        open={dateDialogOpen}
                        onOpenChange={setDateDialogOpen}
                      >
                        <DialogContent className="sm:max-w-fit text-center px-6 pt-8">
                          <DialogHeader>
                            <DialogTitle className="wrap-normal">
                              Edit visited date for {selectedPlace?.name}
                            </DialogTitle>
                          </DialogHeader>
                          <Calendar
                            mode="single"
                            selected={selectedPlace?.visitedAt || undefined}
                            defaultMonth={selectedPlace?.visitedAt || undefined}
                            captionLayout="dropdown"
                            className="mx-auto"
                            onSelect={(date) => {
                              handleVisitedToggle(
                                selectedPlace?.id || "",
                                false,
                                true,
                                date || null,
                              );
                              setSelectedPlace(null);
                              setDateDialogOpen(false);
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
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
            <VisitedCountries
              visitedCountries={visitedCountries}
              visitedPlaces={visitedPlaces}
              refreshVisitedCountries={fetchVisitedCountries}
              locallyUpdateVisitedCountries={locallyUpdateVisitedCountries}
            />
          )}
        </>
      )}

      <Toaster position="top-center" />
    </div>
  );
}

export default VisitedPane;
