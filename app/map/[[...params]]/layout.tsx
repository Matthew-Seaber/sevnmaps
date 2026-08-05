import { checkAuthLoginRedirect } from "@/lib/auth-check";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkAuthLoginRedirect();

  return <main>{children}</main>;
}
