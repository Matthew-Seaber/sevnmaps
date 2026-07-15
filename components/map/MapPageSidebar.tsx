import TextLogo from "@/components/navbar/TextLogoLink";

function MapPageSidebar() {
  return (
  <div className="hidden md:flex flex-col w-72 border-r-2 border-border p-6 mt-2">
    <TextLogo link="/maps" />
  </div>
  )
}

export default MapPageSidebar;
