import { checkAuthRedirect } from "@/lib/auth-check";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkAuthRedirect();

  return <>{children}</>;
}
