"use client";

import TextLogo from "./TextLogo";
import NavbarLinks from "./NavbarLinks";

import { Button } from "@/components/ui/button";

function Navbar() {
  return (
    <nav className="border-b border-border z-2">
      <div className="mx-auto max-w-[1800px] px-4 sm:px-6 flex justify-between items-center py-4 sm:py-6 gap-3">
        <TextLogo />
        <NavbarLinks />

        <div className="flex gap-2 shrink-0">
          <Button
            size="lg"
            variant="outline"
            className="px-4 sm:px-6 sm:h-11"
            onClick={() => {
              window.location.href = "/login";
            }}
          >
            Log in
          </Button>
          <Button
            size="lg"
            className="px-4 sm:px-6 sm:h-11"
            onClick={() => {
              window.location.href = "/signup";
            }}
          >
            Sign up
          </Button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
