import { headers } from "next/headers";
import { auth } from "@/lib/auth";

import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <>
      <Navbar authenticated={!!session} />
      <div className="min-h-[40vh] flex flex-col justify-center text-center space-y-6 m-2">
        <h1 className="text-2xl font-bold">Page Not Found</h1>

        <p>
          We&apos;ve found 1000s of hidden gems, but it appears finding webpages
          isn&apos;t as easy. If you believe this is an error, please contact
          support.
        </p>

        <div className="flex justify-center gap-4">
          <Link href="/">
            <Button className="p-5">Go Home</Button>
          </Link>

          <Link href="/contact">
            <Button className="p-5" variant="outline">
              Contact Support
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
