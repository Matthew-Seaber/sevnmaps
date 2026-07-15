import MapPageNavbar from "@/components/navbar/MapPageNavbar";
import MapPageSidebar from "@/components/map/MapPageSidebar";

function MapPage() {
  return (
    <div className="flex h-screen">
      <MapPageSidebar />

      <div className="flex flex-1 flex-col">
        <MapPageNavbar />

        <main className="flex-1">
          <h1>map</h1>
        </main>
      </div>
    </div>
  );
}

export default MapPage;
