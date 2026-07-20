import { geoMercator, geoPath } from "d3-geo";

import { useMemo, useEffect, useState } from "react";

interface VisitedCountry {
  countryCode: string;
  name: string;
  continent: string;
  flag: string;
  placesVisited: number;
  visitedAt: Date | null;
}

type Country = {
  type: string;
  properties: {
    ADMIN: string;
    ISO_A3: string;
  };
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
};

function CountriesVisitedMap({
  visitedCountries,
}: {
  visitedCountries: VisitedCountry[];
}) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  useEffect(() => {
    fetch("/maps/world.geojson")
      .then((response) => response.json())
      .then((data) => {
        setCountries(data.features);
      });
  }, []);

  const projection = useMemo(
    () => geoMercator().scale(100).translate([400, 300]),
    [],
  );
  const path = useMemo(() => geoPath().projection(projection), [projection]);

  const renderedCountries = useMemo(() => {
    return countries.map((country) => ({
      ...country,
      svgPath: path(country) || "",
    }));
  }, [countries, path]);

  return (
    <svg viewBox="0 0 800 440" width="100%" height="auto">
      {renderedCountries.map((country) => {
        const code = country.properties.ISO_A3;
        const isVisited = visitedCountries.some(
          (cntry) => cntry.countryCode === code,
        );

        return (
          <path
            key={code}
            d={path(country) || ""}
            fill={
              hoveredCountry === code
                ? "var(--sidebar-primary)"
                : isVisited
                  ? "var(--primary)"
                  : "var(--muted-foreground)"
            }
            style={{
              transition: "fill 0.2s ease",
            }}
            stroke="white"
            strokeWidth="0.5"
            onMouseEnter={() => setHoveredCountry(code)}
            onMouseLeave={() => setHoveredCountry(null)}
          />
        );
      })}
    </svg>
  );
}

export default CountriesVisitedMap;
