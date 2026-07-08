"use client";

import { usePathname } from "next/navigation";

import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";

export default function PageConfig({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const unauthenticatedPaths = ["/", "/changelog", "/pricing", "/terms", "/privacy", "/contact", "/about", "/features"];
  const isAuthenticatedPage = !unauthenticatedPaths.includes(pathname);

  if (isAuthenticatedPage) {
    return children;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
