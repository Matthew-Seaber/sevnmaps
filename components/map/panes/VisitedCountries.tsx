"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import CountriesVisitedMap from "./CountriesVisitedMap";
import ConfirmationPopup from "@/components/utility/ConfirmationPopup";

import Image from "next/image";
import { Button } from "@/components/ui/button";
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
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarX2, ChevronRight, MapPinOff, Pencil } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

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

function VisitedCountries({
  visitedCountries,
}: {
  visitedCountries: VisitedCountry[];
}) {
  const [selectedCountry, setSelectedCountry] = useState<VisitedCountry | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [visitedStatusPopupOpen, setVisitedStatusPopupOpen] = useState(false);

  const router = useRouter();

  async function handleDateChange(
    countryId: string | undefined,
    date: Date | undefined,
  ) {
    if (countryId === "" || countryId === undefined) return;

    const response = await fetch("/api/countries/edit_visited_status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ countryId, visitedAt: date }),
    });

    if (!response.ok) {
      console.error("Failed to update visited date");
      toast.error("Failed to update visited status. Please try again later.");
      return;
    }

    router.refresh();
  }

  async function handleRemoveVisited(countryId: string | undefined) {
    if (countryId === "" || countryId === undefined) return;

    const response = await fetch("/api/countries/delete_visited_status", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ countryId }),
    });

    if (!response.ok) {
      console.error("Failed to update visited status");
      toast.error("Failed to update visited status. Please try again later.");
      return;
    }

    toast.success(
      "Visited status for " + selectedCountry?.name + " successfully removed.",
    );
    router.refresh();
  }

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
              {selectedCountry ? (
                <div className="flex flex-row gap-4 items-center">
                  <div className="relative shrink-0 w-5 h-5 rounded-full">
                    <Image
                      src={selectedCountry?.flag}
                      alt={`Flag for ${selectedCountry?.name}`}
                      width={24}
                      height={24}
                      className="w-full h-full rounded-full"
                    />
                  </div>

                  {selectedCountry?.name}
                </div>
              ) : (
                "Error fetching country details"
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedCountry?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-6 px-4">
            <div>
              <li className="mb-4">Continent: {selectedCountry?.continent}</li>
              <li>Places visited: {selectedCountry?.placesVisited}</li>
              <div className="flex gap-2 items-center justify-between">
                <li>
                  Last visited:{" "}
                  {selectedCountry?.visitedAt
                    ? new Date(selectedCountry.visitedAt).toLocaleDateString()
                    : "N/A"}
                </li>
                <div className="flex items-center gap-0.5">
                  <Popover
                    open={datePopoverOpen}
                    onOpenChange={setDatePopoverOpen}
                  >
                    <PopoverTrigger>
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => setDatePopoverOpen(true)}
                        className="p-4"
                      >
                        <Pencil />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0 z-2"
                      align="end"
                    >
                      <Calendar
                        mode="single"
                        selected={selectedCountry?.visitedAt || undefined}
                        defaultMonth={selectedCountry?.visitedAt || undefined}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          handleDateChange(selectedCountry?.id, date);
                          setDatePopoverOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>

                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() =>
                      handleDateChange(selectedCountry?.id, undefined)
                    }
                    className="p-4"
                  >
                    <CalendarX2 />
                  </Button>

                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setVisitedStatusPopupOpen(true)}
                    className="p-4"
                  >
                    <MapPinOff />
                  </Button>
                </div>
              </div>
            </div>

            <h4 className="font-semibold">Recently visited</h4>
          </div>

          <DialogFooter>
            <DialogClose>Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster position="top-center" />
      <ConfirmationPopup
        open={visitedStatusPopupOpen}
        setOpen={setVisitedStatusPopupOpen}
        title="Remove visited status"
        message={`Are you sure you want to mark ${selectedCountry?.name} as "not visited"?`}
        destructive={true}
        confirmText="Confirm"
        cancelText="Cancel"
        onConfirm={() => handleRemoveVisited(selectedCountry?.id)}
      />
    </div>
  );
}

export default VisitedCountries;
