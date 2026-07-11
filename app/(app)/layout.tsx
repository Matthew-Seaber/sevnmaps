import { checkAuth } from "@/lib/auth-check";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkAuth();

  return <>{children}</>;
}
