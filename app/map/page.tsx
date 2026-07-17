import { InfoPaneProvider } from "@/components/map/InfoPaneContext";

import MapPageSidebar from "@/components/map/Sidebar";
import MapPageInfoPane from "@/components/map/InfoPane";
import SearchKeybind from "@/components/map/SearchKeybind";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { Search } from "lucide-react";

interface Place {
  id: string;
  placeName: string;
  latitude: number;
  longitude: number;
  createdAt: Date;
  favorite: boolean;
  visited: boolean;
}

interface PlaceListLink {
  placeId: string;
  listId: string;
}

function MapPage() {
  return (
    <InfoPaneProvider>
      <div className="flex h-screen">
        <MapPageSidebar />

        <div className="flex flex-1 flex-col">
          <SearchKeybind />
          <div className="flex flex-1 overflow-hidden">
            <main className="flex-1">
              <div className="relative w-full max-w-90">
                <InputGroup className="p-1 py-5">
                  <InputGroupInput
                    id="search-input"
                    placeholder="Search locations..."
                  />
                  <InputGroupAddon>
                    <Search className="h-4 w-4" />
                  </InputGroupAddon>
                  <InputGroupAddon
                    align="inline-end"
                    className="hidden lg:flex"
                  >
                    <Kbd>/</Kbd>
                  </InputGroupAddon>
                </InputGroup>
              </div>
              <h1>map</h1>
            </main>

            <MapPageInfoPane />
          </div>
        </div>
      </div>
    </InfoPaneProvider>
  );
}

export default MapPage;
