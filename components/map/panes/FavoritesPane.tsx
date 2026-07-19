import { useCallback, useEffect, useState } from "react";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { Calendar, Heart, MapPin, RefreshCw, Search } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

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
  const [numberOfFavorites, setNumberOfFavorites] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const fetchFavoritePlaces = useCallback(async () => {
    try {
      const response = await fetch("/api/places/favorites/get_favorites");

      if (!response.ok) {
        console.error("Failed to fetch favorite places:", response.statusText);
        return;
      }

      const data = await response.json();
      console.log(data.favoritePlaces);
      setFavoritePlaces(data.favoritePlaces);
      setNumberOfFavorites(data.favoritePlaces.length);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching favorite places:", error);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await fetchFavoritePlaces();
    };

    fetchData();
  }, [fetchFavoritePlaces]);

  const filteredFavoritePlaces = favoritePlaces.filter((place) => {
    const query = searchQuery.toLowerCase();
    return (
      place.name.toLowerCase().includes(query) ||
      place.address.toLowerCase().includes(query)
    );
  });

  async function handleFavoriteToggle(placeID: string) {
    setFavoritePlaces((prevPlaces) =>
      prevPlaces.map((place) =>
        place.id === placeID
          ? { ...place, favorited: !place.favorited }
          : place,
      ),
    );

    setNumberOfFavorites((prevCount) =>
      favoritePlaces.some((place) => place.id === placeID && place.favorited)
        ? prevCount - 1
        : prevCount + 1,
    );

    const response = await fetch("/api/places/favorites/toggle_favorite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        placeId: placeID,
        favorite: !favoritePlaces.find((place) => place.id === placeID),
      }),
    });

    if (!response.ok) {
      console.error("Failed to toggle favorite:", response.statusText);
      toast.error("Failed to toggle favourite. Please try again.");

      setFavoritePlaces((prevPlaces) =>
        prevPlaces.map((place) =>
          place.id === placeID
            ? { ...place, favorited: !place.favorited }
            : place,
        ),
      );

      setNumberOfFavorites((prevCount) =>
        favoritePlaces.some((place) => place.id === placeID && place.favorited)
          ? prevCount + 1
          : prevCount - 1,
      );

      return;
    }
  }

  return (
    <div className="flex flex-col gap-6 mt-4">
      <h1 className="text-2xl font-semibold mb-2">Favourite Places</h1>

      {!loading ? (
        <>
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-row items-center gap-2">
              <p className="font-bold text-sm">
                {numberOfFavorites} favourite
                {numberOfFavorites === 1 ? "" : "s"}
              </p>
              <RefreshCw
                className="w-3.5 h-3.5 cursor-pointer"
                onClick={() => {
                  setLoading(true);
                  fetchFavoritePlaces();
                }}
              />
            </div>
            <InputGroup className="p-1 py-4 max-w-48">
              <InputGroupInput
                id="search-input"
                placeholder="Search favourites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <InputGroupAddon>
                <Search className="h-4 w-4" />
              </InputGroupAddon>
            </InputGroup>
          </div>

          {favoritePlaces.length === 0 ? (
            <p className="mt-2 text-center text-sm text-muted-foreground">
              You haven&apos;t favourited any places yet. Start exploring the
              map and favourite locations to see them here!
            </p>
          ) : (
            <div className="grid grid-cols gap-4">
              {filteredFavoritePlaces.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 mt-2">
                  <p className="text-sm">
                    No favourite places found that match your search query.
                  </p>
                  <Button
                    size="lg"
                    className="p-4"
                    onClick={() => setSearchQuery("")}
                  >
                    Clear search
                  </Button>
                </div>
              ) : (
                filteredFavoritePlaces.map((place) => (
                  <div
                    key={place.id}
                    className="flex flex-row border border-border rounded-md shadow-sm hover:scale-103 transition-transform duration-200 cursor-default"
                  >
                    <div className="relative w-35 h-30 shrink-0">
                      <Image
                        src={place.imageURL}
                        alt={place.name}
                        fill
                        sizes="150px"
                        className="w-full h-full object-cover rounded-l-md"
                      />
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold mb-2">{place.name}</h3>
                      <div className="flex items-start gap-1.5 text-muted-foreground text-sm mb-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <p className="font-semibold break-all">
                          {place.address}
                        </p>
                      </div>
                      <div
                        className="flex items-center gap-1.5 text-muted-foreground text-sm"
                        title={`Favorited on ${new Date(place.favoritedAt).toLocaleString()}`}
                      >
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <p>
                          {new Date(place.favoritedAt).toLocaleString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end pl-4 pr-8 ml-auto">
                      <Heart
                        className={`h-7 w-7 cursor-pointer hover:scale-110 transition-all ${place.favorited ? "fill-red-500 stroke-red-500" : "fill-none stroke-current"}`}
                        onClick={() => handleFavoriteToggle(place.id)}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-row items-center gap-2">
          <Spinner />
          <p className="text-sm">Loading...</p>
        </div>
      )}

      <Toaster position="top-center" />
    </div>
  );
}

export default FavoritesPane;
