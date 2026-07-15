import MapPageNavbar from "@/components/navbar/MapPageNavbar";
import MapPageSidebar from "@/components/map/MapPageSidebar";
import MapPageInfoPane from "@/components/map/MapPageInfoPane";

function MapPage() {
  return (
    <div className="flex h-screen">
      <MapPageSidebar />

      <div className="flex flex-1 flex-col">
        <MapPageNavbar />

        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1">
            <h1>map</h1>
          </main>

          <MapPageInfoPane />
        </div>
      </div>
    </div>
  );
}

export default MapPage;
