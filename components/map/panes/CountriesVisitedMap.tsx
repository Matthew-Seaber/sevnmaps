import { geoNaturalEarth1, geoPath } from "d3-geo";
import type { Feature, Geometry } from "geojson";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";
import { zoom, zoomIdentity } from "d3-zoom";
import type { ZoomBehavior } from "d3-zoom";
import "d3-transition";
import { select } from "d3-selection";

import { useRef } from "react";
import { useMemo, useEffect, useState } from "react";

import { useInfoPane } from ".././InfoPaneContext";

import ConfirmationPopup from "@/components/utility/ConfirmationPopup";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

countries.registerLocale(en);

interface VisitedCountry {
  countryCode: string;
  name: string;
  continent: string;
  description: string;
  flag: string;
  placesVisited: number;
  visitedAt: Date | null;
}

type Country = Feature<
  Geometry,
  {
    name: string;
  }
> & {
  id?: string;
};

function CountriesVisitedMap({
  visitedCountries,
  allowZoom,
}: {
  visitedCountries: VisitedCountry[];
  allowZoom: boolean;
}) {
  const [countryFeatures, setCountryFeatures] = useState<Country[]>([]);
  const [specialRegions, setSpecialRegions] = useState<Feature[]>([]);
  const [markVisitedPopupOpen, setMarkVisitedPopupOpen] = useState(false);
  const [removeVisitedPopupOpen, setRemoveVisitedPopupOpen] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [selectedCountryName, setSelectedCountryName] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  const { openPane, closePane } = useInfoPane();

  const visitedSet = useMemo(
    () => new Set(visitedCountries.map((country) => country.countryCode)),
    [visitedCountries],
  );

  useEffect(() => {
    fetch("/maps/countries-110m.json")
      .then((response) => response.json())
      .then((topology: Topology) => {
        const countries = feature(topology, topology.objects.countries);

        if (countries.type === "FeatureCollection") {
          const filteredCountries = countries.features.filter(
            (country) => country.properties?.name !== "Antarctica",
          ) as Country[];

          setCountryFeatures(filteredCountries);
        }

        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch("/maps/special-regions.json")
      .then((response) => response.json())
      .then((data) => {
        setSpecialRegions(data.features);
      });
  }, []);

  const projection = useMemo(() => {
    if (!countryFeatures || countryFeatures.length === 0) {
      return null;
    }

    return geoNaturalEarth1().fitSize([800, 440], {
      type: "FeatureCollection",
      features: countryFeatures,
    });
  }, [countryFeatures]);

  const path = useMemo(() => geoPath().projection(projection), [projection]);

  const renderedCountries = useMemo(() => {
    return countryFeatures.map((country) => ({
      ...country,
      svgPath: path(country) || "",
    }));
  }, [countryFeatures, path]);

  const renderedSpecialRegions = useMemo(() => {
    return specialRegions.map((region) => ({
      ...region,
      svgPath: path(region) || "",
    }));
  }, [specialRegions, path]);

  const SVGRef = useRef<SVGSVGElement | null>(null);
  const mapGroupRef = useRef<SVGGElement | null>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    if (!SVGRef.current || !mapGroupRef.current || !allowZoom) return;

    const svg = select(SVGRef.current);
    const mapGroup = select(mapGroupRef.current);

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 5])
      .extent([
        [0, 0],
        [800, 440],
      ])
      .translateExtent([
        [0, 0],
        [800, 440],
      ])
      .on("zoom", (event) => {
        mapGroup.attr("transform", event.transform);
        setZoomLevel(event.transform.k);
      });

    zoomRef.current = zoomBehavior;

    svg.call(zoomBehavior).call(zoomBehavior.transform, zoomIdentity);

    return () => {
      svg.on(".zoom", null);
    };
  }, [countryFeatures, allowZoom]);

  const zoomIn = () => {
    if (!SVGRef.current || !zoomRef.current) return;

    select(SVGRef.current).transition().call(zoomRef.current.scaleBy, 1.5);
  };

  const zoomOut = () => {
    if (!SVGRef.current || !zoomRef.current) return;

    select(SVGRef.current).transition().call(zoomRef.current.scaleBy, 0.5);
  };

  async function handleMarkAsVisited() {
    if (!selectedCountryCode) return;

    try {
      const response = await fetch("/api/countries/mark_visited", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ countryId: selectedCountryCode }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark country as visited");
      }

      toast.success(
        `Successfully marked ${selectedCountryName || selectedCountryCode} as visited!`,
      );

      closePane();
      setTimeout(() => {
        openPane({ type: "visited" });
      }, 50);
    } catch (error) {
      console.error("Error marking country as visited:", error);

      toast.error("Failed to mark country as visited. Please try again later.");
    }
  }

  async function handleRemoveVisited() {
    if (!selectedCountryCode) return;

    try {
      const response = await fetch("/api/countries/delete_visited_status", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ countryId: selectedCountryCode, type: "code" }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark country as not visited");
      }

      toast.success(
        `Successfully removed visited status from ${selectedCountryName || selectedCountryCode}.`,
      );

      closePane();
      setTimeout(() => {
        openPane({ type: "visited" });
      }, 50);
    } catch (error) {
      console.error("Error marking country as not visited:", error);

      toast.error("Failed to remove visited status. Please try again later.");
    }
  }

  return (
    <>
      {loading ? (
        <div className="flex flex-row items-center gap-2">
          <Spinner />
          <p className="text-sm">Loading...</p>
        </div>
      ) : (
        <>
          <div className="relative w-full aspect-800/440">
            <div className="absolute top-1/8 -translate-y-1/2 right-4 z-20 flex flex-col gap-0.5">
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="outline"
                    size="xs"
                    className="font-bold opacity-75"
                  >
                    ?
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    We are aware of some geopolitical issues with borders on
                    this map and are actively working to address them. Thank you
                    for your patience.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>

            {allowZoom && (
              <div className="absolute top-1/2 -translate-y-1/2 right-4 z-20 flex flex-col gap-0.5">
                <Button
                  variant="outline"
                  size="xs"
                  disabled={zoomLevel >= 5}
                  className={`font-bold text-md opacity-75 ${zoomLevel >= 5 ? "opacity-50 text-muted-foreground" : ""}`}
                  onClick={zoomIn}
                >
                  +
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  className={`font-bold text-md opacity-75 ${zoomLevel <= 1 ? "opacity-50 text-muted-foreground" : ""}`}
                  onClick={zoomOut}
                >
                  -
                </Button>
              </div>
            )}

            <svg ref={SVGRef} viewBox="0 0 800 440" className="w-full h-full">
              <g ref={mapGroupRef}>
                {renderedCountries.map((country) => {
                  const code = country.id
                    ? countries.numericToAlpha3(country.id)
                    : null;
                  const isVisited = code ? visitedSet.has(code) : false;

                  return (
                    <path
                      key={code || country.properties.name}
                      d={country.svgPath}
                      className={` hover:fill-primary/80 cursor-pointer transition-colors
                        ${isVisited ? "fill-primary" : "fill-muted-foreground"}
                      `}
                      onClick={() => {
                        const clickedCountryCode =
                          code || country.properties.name;
                        const clickedCountryName =
                          country.properties.name || clickedCountryCode;

                        setSelectedCountryCode(clickedCountryCode);
                        setSelectedCountryName(clickedCountryName);

                        if (isVisited === false) {
                          setMarkVisitedPopupOpen(true);
                        } else {
                          setRemoveVisitedPopupOpen(true);
                        }
                      }}
                      stroke="white"
                      strokeWidth="0.5"
                    />
                  );
                })}

                {renderedSpecialRegions.map((region) => (
                  <path
                    key={region.properties?.name}
                    d={region.svgPath}
                    className={`hover:fill-primary/80 cursor-pointer transition-colors
                      ${
                        visitedCountries.some(
                          (country) =>
                            country.countryCode ===
                            region.properties?.countryCode,
                        )
                          ? "fill-primary"
                          : "fill-muted-foreground"
                      }`}
                  />
                ))}
              </g>
            </svg>
          </div>

          <div className="flex flex-row items-center gap-8 font-medium text-xs px-2">
            <div className="flex flex-row items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <p>Visited</p>
            </div>
            <div className="flex flex-row items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted-foreground" />
              <p>Not yet visited</p>
            </div>
          </div>
        </>
      )}

      <ConfirmationPopup
        open={markVisitedPopupOpen}
        setOpen={setMarkVisitedPopupOpen}
        title="Mark as visited"
        message={`Are you sure you want to mark '${selectedCountryName || selectedCountryCode}' as visited?`}
        destructive={false}
        confirmText="Mark as visited"
        cancelText="Cancel"
        onConfirm={handleMarkAsVisited}
      />

      <ConfirmationPopup
        open={removeVisitedPopupOpen}
        setOpen={setRemoveVisitedPopupOpen}
        title="Remove visited status"
        message={`Are you sure you want to mark ${selectedCountryName || selectedCountryCode} as 'not visited?'`}
        destructive={true}
        confirmText="Confirm"
        cancelText="Cancel"
        onConfirm={handleRemoveVisited}
      />

      <Toaster position="top-center" />
    </>
  );
}

export default CountriesVisitedMap;
