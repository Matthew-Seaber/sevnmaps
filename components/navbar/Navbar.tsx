"use client";

import TextLogo from "./TextLogo";
import NavbarLinks from "./NavbarLinks";

import { Button } from "@/components/ui/button";

function Navbar() {
  return (
    <nav className="border-b border-border z-2">
      <div className="mx-auto max-w-[1800px] px-6 flex justify-between items-center py-6 gap-4">
        <TextLogo />
        <NavbarLinks />

        <div className="space-x-2">
          <Button
            size="lg"
            variant="outline"
            className="px-6 py-5"
            onClick={() => {
              window.location.href = "/login";
            }}
          >
            Log in
          </Button>
          <Button
            size="lg"
            className="px-6 py-5"
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
