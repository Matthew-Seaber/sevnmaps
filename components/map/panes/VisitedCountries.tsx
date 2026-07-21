"use client";

import { useState } from "react";

import CountriesVisitedMap from "./CountriesVisitedMap";

import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { ChevronRight } from "lucide-react";

interface VisitedCountry {
  countryCode: string;
  name: string;
  continent: string;
  flag: string;
  placesVisited: number;
  visitedAt: Date | null;
}

function VisitedCountries({
  visitedCountries,
}: {
  visitedCountries: VisitedCountry[];
}) {
  const [selectedCountry, setSelectedCountry] = useState<VisitedCountry | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <CountriesVisitedMap
        visitedCountries={visitedCountries}
        allowZoom={true}
      />

      <Separator />

      <h4 className="mt-2 font-bold text-sm">
        You&apos;ve visited{" "}
        <span className="text-primary">
          {visitedCountries.length}{" "}
          {visitedCountries.length === 1 ? "country" : "countries"}
        </span>
      </h4>

      <div className="grid grid-cols-2 gap-2">
        {visitedCountries.map((country) => (
          <div
            key={country.countryCode}
            onClick={() => {
              setSelectedCountry(country);
              setDialogOpen(true);
            }}
            className="flex flex-row gap-4 items-center border border-border rounded-md p-4 cursor-pointer hover:bg-accent transition-colors"
          >
            <div className="relative shrink-0 w-10 h-10 border-2 border-border rounded-full">
              <Image
                src={country.flag}
                alt={`Flag for ${country.name}`}
                width={64}
                height={48}
                className="w-full h-full rounded-full"
              />
            </div>

            <div className="flex flex-col gap-1">
              <h5 className="font-bold">{country.name}</h5>
              <p className="font-medium text-sm text-muted-foreground">
                {country.placesVisited}{" "}
                {country.placesVisited === 1 ? "place" : "places"} visited
              </p>
            </div>

            <div className="flex items-center justify-end pl-4 ml-auto">
              <ChevronRight className="text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCountry && (
                <div>
                  <Image
                    src={selectedCountry?.flag}
                    alt={`Flag for ${selectedCountry?.name}`}
                    width={24}
                    height={24}
                    className="w-full h-full rounded-full"
                  />
                  <h1>{selectedCountry?.name}</h1>
                </div>
              ) : (
                "Error fetching country details"
              )}
            </DialogTitle>
            <DialogDescription>{selectedCountry?.continent}</DialogDescription>
          </DialogHeader>

          <div></div>

          <DialogFooter>
            <DialogClose>Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default VisitedCountries;
