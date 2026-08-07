import { InfoPaneProvider } from "@/components/map/InfoPaneContext";

import MapPageClient from "@/components/map/MapPageClient";
import MapPageSidebar from "@/components/map/Sidebar";
import MapPageInfoPane from "@/components/map/InfoPane";
import InfoPaneCloseKeybind from "@/components/map/InfoPaneCloseKeybind";
import SearchKeybind from "@/components/map/SearchKeybind";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { Search } from "lucide-react";

type MapPageProps = {
  params: Promise<{
    params?: string[];
  }>;
};

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

async function MapPage({ params }: MapPageProps) {
  const resolvedParams = await params;

  const type = resolvedParams.params?.[0];
  const id = resolvedParams.params?.[1];

  return (
    <InfoPaneProvider>
      <div className="flex h-screen">
        <MapPageSidebar />

        <div className="flex flex-1 flex-col">
          <SearchKeybind />
          <InfoPaneCloseKeybind />

          <div className="flex flex-1 overflow-hidden">
            <main className="relative flex-1">
              <MapPageClient type={type} id={id} />

              <div className="absolute top-4 left-4 w-full max-w-90 z-20">
                <InputGroup className="p-1 py-5 bg-background">
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
            </main>

            <MapPageInfoPane />
          </div>
        </div>
      </div>
    </InfoPaneProvider>
  );
}

export default MapPage;
