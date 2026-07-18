import { useEffect, useState } from "react";

import Image from "next/image";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { Search } from "lucide-react";

interface FavoritePlace {
  id: string;
  name: string;
  imageURL: string;
  address: string;
  favorited: boolean;
  favoritedAt: Date;
}

function FavoritesPane() {
  const [favoritePlaces, setFavoritePlaces] = useState<FavoritePlace[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchFavoritePlaces() {
      try {
        const response = await fetch("/api/places/favorites/get_favorites");

        if (!response.ok) {
          console.error(
            "Failed to fetch favorite places:",
            response.statusText,
          );
          return;
        }

        const data = await response.json();
        console.log(data.favoritePlaces);
        setFavoritePlaces(data.favoritePlaces);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching favorite places:", error);
      }
    }

    fetchFavoritePlaces();
  }, []);

  return (
    <div className="flex flex-col gap-6 mt-4">
      <h1 className="text-2xl font-semibold mb-2">Favourites</h1>

      {!loading ? (
        <>
          <div className="flex flex-row justify-between items-center">
            <p className="font-bold text-sm">
              {favoritePlaces.length} favourite
              {favoritePlaces.length === 1 ? "" : "s"}
            </p>
            <InputGroup className="p-1 py-4 max-w-48">
              <InputGroupInput
                id="search-input"
                placeholder="Search favourites..."
              />
              <InputGroupAddon>
                <Search className="h-4 w-4" />
              </InputGroupAddon>
            </InputGroup>
          </div>

          {favoritePlaces.length === 0 ? (
            <p className="mt-2 text-center text-sm text-muted-foreground">
              You have not favourited any places yet.
            </p>
          ) : (
            <div className="grid grid-cols gap-2">
              {favoritePlaces.map((place) => (
                <div
                  key={place.id}
                  className="flex flex-row justify-center border border-border rounded-md shadow-md hover:scale-102 transition-transform duration-200 cursor-default"
                >
                  <Image
                    src={place.imageURL}
                    alt={place.name}
                    width={100}
                    height={100}
                    className="object-cover rounded-md"
                  />
                  <div className="p-4">
                    <h3 className="font-bold mb-1">{place.name}</h3>
                    <div className="text-muted-foreground text-sm">
                      <p className="font-semibold">{place.address}</p>
                    </div>
                    <div className="text-muted-foreground text-sm">
                      <p
                        title={`Favorited on ${new Date(place.favoritedAt).toLocaleString()}`}
                      >
                        {new Date(place.favoritedAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="p-4"></div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-row items-center gap-2">
          <Spinner />
          <p className="text-sm">Loading...</p>
        </div>
      )}
    </div>
  );
}

export default FavoritesPane;
