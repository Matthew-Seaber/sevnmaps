"use client";

import { useState } from "react";

import TextLogo from "@/components/navbar/TextLogoLink";

import { Button } from "@/components/ui/button";
import { CircleCheck, FolderClosed, Heart, House } from "lucide-react";

function MapPageSidebar() {
  const [currentTab, setCurrentTab] = useState("home");

  return (
    <div className="hidden md:flex flex-col w-72 border-r-2 border-border p-6 pt-8 shadow-xl">
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
    </div>
  );
}

export default MapPageSidebar;
