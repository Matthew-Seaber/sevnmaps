interface VisitedCountry {
  countryCode: string;
  name: string;
  flag: string;
  placesVisited: number;
  lastVisitedAt: Date;
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
