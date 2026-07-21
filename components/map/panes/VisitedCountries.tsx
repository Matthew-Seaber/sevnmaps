import CountriesVisitedMap from "./CountriesVisitedMap";

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
  return (
    <div>
      <CountriesVisitedMap visitedCountries={visitedCountries} allowZoom={true} />
    </div>
  );
}

export default VisitedCountries;
