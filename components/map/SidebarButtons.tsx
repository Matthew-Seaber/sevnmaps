"use client";

import { useState } from "react";

import { useInfoPane } from "./InfoPaneContext";

import { Button } from "@/components/ui/button";
import {
  CircleCheck,
  FolderClosed,
  Heart,
  House,
  Clock,
  Shuffle,
} from "lucide-react";

interface Place {
  id: string;
  placeName: string;
  address: string;
  longitude: number;
  latitude: number;
  favorite: boolean;
  visited: boolean;
  inList: boolean;
  listColor?: string | null;
  createdAt: Date;
}

function SidebarButtons({
  discoverButtons,
  placeData,
}: {
  discoverButtons: boolean;
  placeData: Place[];
}) {
  const [sortedPlacesRemaining, setSortedPlacesRemaining] = useState<Place[]>(
    [...placeData].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  );
  const [randomPlacesRemaining, setRandomPlacesRemaining] = useState<Place[]>([
    ...placeData,
  ]);

  const { infoPaneState, openPane, closePane } = useInfoPane();

  const currentTab =
    infoPaneState.type === "closed" ? "home" : infoPaneState.type;

  function changeTab(tab: string) {
    switch (tab) {
      case "home":
        closePane();
        break;

      case "favorites":
        openPane({ type: "favorites" });
        break;

      case "visited":
        openPane({ type: "visited" });
        break;

      case "lists":
        openPane({ type: "lists" });
        break;
    }
  }

  function handleRecentlyAdded() {
    if (placeData.length === 0) return;

    let sortedPlaces = sortedPlacesRemaining;

    if (sortedPlaces.length === 0) {
      sortedPlaces = [...placeData].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    const nextPlaceID = sortedPlaces[0].id;

    openPane({ type: "place", placeID: nextPlaceID });
    setSortedPlacesRemaining(sortedPlaces.slice(1));
  }

  function handleRandomPlace() {
    if (placeData.length === 0) return;

    let randomPlaces = randomPlacesRemaining;

    if (randomPlaces.length === 0) {
      randomPlaces = [...placeData];
    }

    const randomIndex = Math.floor(Math.random() * randomPlaces.length);
    const randomPlaceID = randomPlaces[randomIndex].id;

    openPane({ type: "place", placeID: randomPlaceID });
    setRandomPlacesRemaining(
      randomPlaces.filter((place) => place.id !== randomPlaceID),
    );
  }

  return (
    <>
      <div className="flex flex-col gap-0.5 mt-6">
        <Button
          variant="ghost"
          className={`justify-start gap-3 p-3 h-11 transition-all duration-300 hover:bg-primary/10 ${currentTab === "home" ? "bg-primary/15 font-semibold text-primary hover:text-primay shadow-[inset_0_2px_6px_rgba(0,0,0,0.08)] border border-primary/10" : "text-muted-foreground hover:shadow-[inset_0_2px_6px_rgba(0,0,0,0.08)]"}`}
          onClick={() => changeTab("home")}
        >
          <House
            className={`transition-all duration-300 ${currentTab === "home" ? "text-primary" : ""}`}
          />
          Home
        </Button>
        <Button
          variant="ghost"
          className={`justify-start gap-3 p-3 h-11 transition-all duration-300 hover:bg-primary/10 ${currentTab === "favorites" ? "bg-primary/15 font-semibold text-primary hover:text-primary shadow-[inset_0_2px_6px_rgba(0,0,0,0.08)] border border-primary/10" : "text-muted-foreground hover:shadow-[inset_0_2px_6px_rgba(0,0,0,0.08)]"}`}
          onClick={() => changeTab("favorites")}
        >
          <Heart
            className={`transition-all duration-300 ${currentTab === "favorites" ? "text-primary" : ""}`}
          />
          Favourites
        </Button>
        <Button
          variant="ghost"
          className={`justify-start gap-3 p-3 h-11 transition-all duration-300 hover:bg-primary/10 ${currentTab === "visited" ? "bg-primary/15 font-semibold text-primary hover:text-primary shadow-[inset_0_2px_6px_rgba(0,0,0,0.08)] border border-primary/10" : "text-muted-foreground hover:shadow-[inset_0_2px_6px_rgba(0,0,0,0.08)]"}`}
          onClick={() => changeTab("visited")}
        >
          <CircleCheck
            className={`transition-all duration-300 ${currentTab === "visited" ? "text-primary" : ""}`}
          />
          Visited
        </Button>
        <Button
          variant="ghost"
          className={`justify-start gap-3 p-3 h-11 transition-all duration-300 hover:bg-primary/10 ${currentTab === "lists" ? "bg-primary/15 font-semibold text-primary hover:text-primary shadow-[inset_0_2px_6px_rgba(0,0,0,0.08)] border border-primary/10" : "text-muted-foreground hover:shadow-[inset_0_2px_6px_rgba(0,0,0,0.08)]"}`}
          onClick={() => changeTab("lists")}
        >
          <FolderClosed
            className={`transition-all duration-300 ${currentTab === "lists" ? "text-primary" : ""}`}
          />
          Lists
        </Button>
      </div>

      {discoverButtons && (
        <div className="flex flex-col gap-0.5 mt-6">
          <div className="flex items-center gap-3 pb-2">
            <h3 className="text-sm font-medium pl-3 cursor-default">
              DISCOVER
            </h3>
            <div className="h-px flex-1 bg-border" />
          </div>
          <Button
            variant="ghost"
            className={`justify-start gap-3 p-3 h-10 transition-all duration-200 hover:bg-primary/30 text-muted-foreground hover:shadow-[inset_0_2px_6px_rgba(0,0,0,0.05)]`}
            onClick={handleRecentlyAdded}
          >
            <Clock />
            Recently Added
          </Button>
          <Button
            variant="ghost"
            className={`justify-start gap-3 p-3 h-10 transition-all duration-200 hover:bg-primary/30 text-muted-foreground hover:shadow-[inset_0_2px_6px_rgba(0,0,0,0.05)]`}
            onClick={handleRandomPlace}
          >
            <Shuffle />
            Random Place
          </Button>
        </div>
      )}
    </>
  );
}

export default SidebarButtons;
