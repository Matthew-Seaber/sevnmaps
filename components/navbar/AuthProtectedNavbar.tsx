"use client";

import TextLogo from "./TextLogoLink";

function AuthProtectedNavbar() {
  return (
    <nav className="z-2">
      <div className="mx-auto max-w-[1800px] px-4 sm:px-6 flex justify-between items-center py-4 sm:py-6 gap-3">
        <TextLogo link="/maps"/>
      </div>
    </nav>
  );
}

export default AuthProtectedNavbar;
