import { checkAuthLoginRedirect } from "@/lib/auth-check";

import AuthProtectedNavbar from "@/components/navbar/AuthProtectedNavbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkAuthLoginRedirect();

  return (
    <>
      <AuthProtectedNavbar />
      <main>{children}</main>
    </>
  );
}
