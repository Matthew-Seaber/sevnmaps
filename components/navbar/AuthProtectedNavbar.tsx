import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

import NavbarMenu from "./NavbarMenu";
import TextLogo from "./TextLogoLink";

async function AuthProtectedNavbar() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const profileLink = session.user.image || "";
  const name = session.user.name;

  return (
    <nav className="z-2">
      <div className="mx-auto max-w-[1800px] px-4 sm:px-6 flex justify-between items-center py-4 sm:py-6 gap-3">
        <TextLogo link="/maps" />
        <NavbarMenu profileLink={profileLink} name={name} />
      </div>
    </nav>
  );
}

export default AuthProtectedNavbar;
