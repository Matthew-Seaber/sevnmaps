import { checkAuthLoginRedirect } from "@/lib/auth-check";

import MapPageNavbar from "@/components/navbar/MapPageNavbar";
import MapPageSidebar from "@/components/map/MapPageSidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkAuthLoginRedirect();

  return (
    <div className="flex h-screen">
      <MapPageSidebar />

      <div className="flex flex-1 flex-col">
        <MapPageNavbar />

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
