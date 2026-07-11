"use client";

import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div className="min-h-[40vh] flex flex-col justify-center text-center space-y-6 m-2">
        <h1 className="text-2xl font-bold">Page Not Found</h1>

        <p>
          We&apos;ve found 1000s of hidden gems, but it appears finding webpages
          isn&apos;t as easy. If you believe this is an error, please contact
          support.
        </p>

        <div className="flex justify-center gap-4">
          <Button className="p-5" onClick={() => (window.location.href = "/")}>
            Go Home
          </Button>

          <Button
            className="p-5"
            variant="outline"
            onClick={() => (window.location.href = "/contact")}
          >
            Contact Support
          </Button>
        </div>
      </div>
      <Footer />
    </>
  );
}
