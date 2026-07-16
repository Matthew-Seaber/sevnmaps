"use client";

import MapPageProfileSection from "@/components/map/ProfileSectionServer";

import { useEffect, useState } from "react";

import TextLogo from "@/components/navbar/TextLogoLink";

import { Button } from "@/components/ui/button";
import {
  CircleCheck,
  Clock,
  FolderClosed,
  Heart,
  House,
  Shuffle,
} from "lucide-react";

interface SidebarList {
  id: string;
  listName: string;
  listColor: string;
  placeCount: number;
}

function MapPageSidebar() {
  const [currentTab, setCurrentTab] = useState("home");
  const [sidebarLists, setSidebarLists] = useState<SidebarList[]>([]);

  useEffect(() => {
    async function fetchMinimalLists() {
      const response = await fetch("/api/lists/get_lists_minimal", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch user lists:", response.statusText);
        return [];
      }

      const data = await response.json();
      setSidebarLists(data.lists);
    }

    fetchMinimalLists();
  }, []);

  return (
    <div className="hidden md:flex flex-col w-72 border-r-2 border-border p-6 shadow-xl">
      <TextLogo link="/map" />

      <div className="flex flex-col gap-0.5 mt-6">
        <Button
          variant="ghost"
          className={`justify-start gap-3 p-3 h-11 transition-all duration-300 hover:bg-primary/10 ${currentTab === "home" ? "bg-primary/15 font-semibold text-primary hover:text-primay shadow-[inset_0_2px_6px_rgba(0,0,0,0.08)] border border-primary/10" : "text-muted-foreground hover:shadow-[inset_0_2px_6px_rgba(0,0,0,0.08)]"}`}
          onClick={() => setCurrentTab("home")}
        >
          <House
            className={`transition-all duration-300 ${currentTab === "home" ? "text-primary" : ""}`}
          />
          Home
        </Button>
        <Button
          variant="ghost"
          className={`justify-start gap-3 p-3 h-11 transition-all duration-300 hover:bg-primary/10 ${currentTab === "favorites" ? "bg-primary/15 font-semibold text-primary hover:text-primary shadow-[inset_0_2px_6px_rgba(0,0,0,0.08)] border border-primary/10" : "text-muted-foreground hover:shadow-[inset_0_2px_6px_rgba(0,0,0,0.08)]"}`}
          onClick={() => setCurrentTab("favorites")}
        >
          <Heart
            className={`transition-all duration-300 ${currentTab === "favorites" ? "text-primary" : ""}`}
          />
          Favorites
        </Button>
        <Button
          variant="ghost"
          className={`justify-start gap-3 p-3 h-11 transition-all duration-300 hover:bg-primary/10 ${currentTab === "visited" ? "bg-primary/15 font-semibold text-primary hover:text-primary shadow-[inset_0_2px_6px_rgba(0,0,0,0.08)] border border-primary/10" : "text-muted-foreground hover:shadow-[inset_0_2px_6px_rgba(0,0,0,0.08)]"}`}
          onClick={() => setCurrentTab("visited")}
        >
          <CircleCheck
            className={`transition-all duration-300 ${currentTab === "visited" ? "text-primary" : ""}`}
          />
          Visited
        </Button>
        <Button
          variant="ghost"
          className={`justify-start gap-3 p-3 h-11 transition-all duration-300 hover:bg-primary/10 ${currentTab === "lists" ? "bg-primary/15 font-semibold text-primary hover:text-primary shadow-[inset_0_2px_6px_rgba(0,0,0,0.08)] border border-primary/10" : "text-muted-foreground hover:shadow-[inset_0_2px_6px_rgba(0,0,0,0.08)]"}`}
          onClick={() => setCurrentTab("lists")}
        >
          <FolderClosed
            className={`transition-all duration-300 ${currentTab === "lists" ? "text-primary" : ""}`}
          />
          Lists
        </Button>
      </div>

      <div className="flex flex-col gap-0.5 mt-6">
        <div className="flex items-center gap-3 pb-2">
          <h3 className="text-sm font-medium pl-3">DISCOVER</h3>
          <div className="h-px flex-1 bg-border" />
        </div>
        <Button
          variant="ghost"
          className={`justify-start gap-3 p-3 h-10 transition-all duration-200 hover:bg-primary/30 text-muted-foreground hover:shadow-[inset_0_2px_6px_rgba(0,0,0,0.05)]`}
        >
          <Clock />
          Recently Added
        </Button>
        <Button
          variant="ghost"
          className={`justify-start gap-3 p-3 h-10 transition-all duration-200 hover:bg-primary/30 text-muted-foreground hover:shadow-[inset_0_2px_6px_rgba(0,0,0,0.05)]`}
        >
          <Shuffle />
          Random Place
        </Button>
      </div>

      <div className="flex flex-col gap-0.5 mt-6">
        <div className="flex items-center gap-3 pb-2">
          <h3 className="text-sm font-medium pl-3">YOUR LISTS</h3>
          <div className="h-px flex-1 bg-border" />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 font-semibold text-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
          >
            +
          </Button>
        </div>
        {sidebarLists.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center">
            No lists found
          </p>
        ) : (
          <div className="flex flex-col gap-0.5 px-1">
            {sidebarLists.map((list) => {
              return (
                <div
                  key={list.id}
                  className="flex flex-row justify-between items-center hover:bg-primary/10 cursor-default rounded-lg px-3 py-1"
                >
                  <div className="flex flex-row items-center gap-3">
                    <span
                      className={`inline-block w-2 h-2 rounded-full`}
                      style={{ backgroundColor: `#${list.listColor}` }}
                    />
                    <p className="font-semibold text-sm">{list.listName}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      {list.placeCount}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <MapPageProfileSection />
    </div>
  );
}

export default MapPageSidebar;
