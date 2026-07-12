import { checkAuthMapRedirect } from "@/lib/auth-check";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkAuthMapRedirect();

  return <>{children}</>;
}
