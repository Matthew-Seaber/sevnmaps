import { useEffect, useState } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Search } from "lucide-react";

interface FavoritePlace {
  id: string;
  name: string;
  imageURL: string;
  favorited: boolean;
  favoritedAt: string;
}

function FavoritesPane() {
  const [favoritePlaces, setFavoritePlaces] = useState<FavoritePlace[]>([]);

  useEffect(() => {
    async function fetchFavoritePlaces() {
      try {
        const response = await fetch("/api/favorites/get_favorites");

        if (!response.ok) {
          console.error(
            "Failed to fetch favorite places:",
            response.statusText,
          );
          return;
        }

        const data = await response.json();
        setFavoritePlaces(data.favoritePlaces);
      } catch (error) {
        console.error("Error fetching favorite places:", error);
      }
    }
  }, []);

  return (
    <div className="flex flex-col gap-6 mt-4">
      <h1 className="text-2xl font-semibold mb-2">Favourites</h1>

      <div className="flex flex-row justify-between items-center">
        <p className="font-bold text-sm">{favoritePlaces.length} favourites</p>
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
              className="border border-border rounded-md shadow-md"
            ></div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FavoritesPane;
