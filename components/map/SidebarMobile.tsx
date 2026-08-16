import TextLogo from "@/components/navbar/TextLogoLink";
import MapPageProfileSection from "@/components/map/ProfileSectionServer";
import SidebarButtons from "@/components/map/SidebarButtons";
import ListsComponent from "@/components/map/ListsComponent";

interface SidebarList {
  id: string;
  listName: string;
  listColor: string;
  placeCount: number;
}

async function MapPageSheet({
  listsKey,
  sidebarLists,
}: {
  listsKey: string;
  sidebarLists: SidebarList[];
}) {
  return (
    <div className="flex flex-col justify-between w-72 border-r-2 border-border p-6 shadow-xl">
      {/* Need to turn into sheet */}

      <div>
        <TextLogo link="/map" />

        <SidebarButtons discoverButtons={false} />

        <ListsComponent key={listsKey} sidebarLists={sidebarLists} />
      </div>

      <div className="w-full flex justify-center">
        <MapPageProfileSection />
      </div>
    </div>
  );
}

export default MapPageSheet;
