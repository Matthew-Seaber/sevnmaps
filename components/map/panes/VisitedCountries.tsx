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
      <p>temp</p>
    )
}

export default VisitedCountries;
