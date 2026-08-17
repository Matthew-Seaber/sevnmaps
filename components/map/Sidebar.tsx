import TextLogo from "@/components/navbar/TextLogoLink";
import MapPageProfileSection from "@/components/navbar/ProfileSectionServer";
import SidebarButtons from "@/components/map/SidebarButtons";
import ListsComponent from "@/components/map/ListsComponent";

interface SidebarList {
  id: string;
  listName: string;
  listColor: string;
  placeCount: number;
}

async function MapPageSidebar({
  listsKey,
  sidebarLists,
}: {
  listsKey: string;
  sidebarLists: SidebarList[];
}) {
  return (
    <div className="flex flex-col justify-between w-72 border-r-2 border-border p-6">
      <div>
        <TextLogo link="/map" />

        <SidebarButtons discoverButtons={true} />

        <ListsComponent key={listsKey} sidebarLists={sidebarLists} />
      </div>

      <div className="w-full flex justify-center">
        <MapPageProfileSection nameVisible="default" />
      </div>
    </div>
  );
}

export default MapPageSidebar;
