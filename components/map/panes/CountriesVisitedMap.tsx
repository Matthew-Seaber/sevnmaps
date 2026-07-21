import { geoMercator, geoPath } from "d3-geo";
import type { Feature, Geometry } from "geojson";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";

import { useMemo, useEffect, useState } from "react";

import { Spinner } from "@/components/ui/spinner";

countries.registerLocale(en);

interface VisitedCountry {
  countryCode: string;
  name: string;
  continent: string;
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
}: {
  visitedCountries: VisitedCountry[];
}) {
  const [countryFeatures, setCountryFeatures] = useState<Country[]>([]);
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
          setCountryFeatures(countries.features as Country[]);
        }

        setLoading(false);
      });
  }, []);

  const projection = useMemo(
    () =>
      geoMercator().fitSize([800, 440], {
        type: "FeatureCollection",
        features: countryFeatures,
      }),
    [countryFeatures],
  );
  const path = useMemo(() => geoPath().projection(projection), [projection]);

  const renderedCountries = useMemo(() => {
    return countryFeatures.map((country) => ({
      ...country,
      svgPath: path(country) || "",
    }));
  }, [countryFeatures, path]);

  return (
    <>
      {loading ? (
        <div className="flex flex-row items-center gap-2">
          <Spinner />
          <p className="text-sm">Loading...</p>
        </div>
      ) : (
        <>
          <svg viewBox="0 0 800 440" width="100%" height="auto">
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
          </svg>

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
