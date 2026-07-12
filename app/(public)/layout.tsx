import { headers } from "next/headers";
import { auth } from "@/lib/auth";

import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <>
      <Navbar authenticated={!!session} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
