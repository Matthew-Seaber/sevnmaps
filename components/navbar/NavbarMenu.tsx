"use client";

import { useState } from "react";

import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  ChevronUp,
  ChevronDown,
  CircleUserRound,
  WandSparkles,
} from "lucide-react";

function NavbarMenu({
  profileLink,
  name,
}: {
  profileLink: string;
  name: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-6 sm:gap-8 text-gray-700">
        <Bell
          className="w-5 h-5 hover:cursor-pointer"
          onClick={() => {
            // Notification pane open
          }}
        />

        <div
          className="flex items-center gap-2 sm:gap-3 hover:cursor-pointer"
          onClick={() => {
            setMenuOpen(!menuOpen);
          }}
        >
          {profileLink !== "" ? (
            <Image
              src={profileLink}
              alt="User's profile picture"
              width={30}
              height={30}
              loading="eager"
              className="w-auto h-auto rounded-full drop-shadow-xl"
            />
          ) : (
            <CircleUserRound
              strokeWidth={1.5}
              className="w-8 h-8 bg-primary text-primary-foreground rounded-full drop-shadow-xl"
            />
          )}
          <p className="hidden sm:flex font-semibold text-sm">{name}</p>
          {(menuOpen && <ChevronUp className="w-4 h-4" />) || (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="absolute">
          <DropdownMenu>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    window.location.href = "/pricing";
                  }}
                >
                  <WandSparkles />
                  Upgrade
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    window.location.href = "/profile";
                  }}
                >
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    window.location.href = "/billing";
                  }}
                >
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    window.location.href = "/support";
                  }}
                >
                  Support
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    window.location.href = "/settings";
                  }}
                >
                  Settings
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem variant="destructive">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </>
  );
}

export default NavbarMenu;
