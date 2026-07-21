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

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

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
  const [zoomLevel, setZoomLevel] = useState(1);
  const [loading, setLoading] = useState(true);

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
            {allowZoom && (
              <div className="absolute top-1/2 -translate-y-1/2 right-4 z-2 flex flex-col gap-0.5">
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
                      className={
                        isVisited ? "fill-primary" : "fill-muted-foreground"
                      }
                      stroke="white"
                      strokeWidth="0.5"
                    />
                  );
                })}

                {renderedSpecialRegions.map((region) => (
                  <path
                    key={region.properties?.name}
                    d={region.svgPath}
                    className={
                      visitedCountries.some(
                        (country) =>
                          country.countryCode ===
                          region.properties?.countryCode,
                      )
                        ? "fill-primary"
                        : "fill-muted-foreground"
                    }
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
    </>
  );
}

export default CountriesVisitedMap;
