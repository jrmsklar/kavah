import { DashboardShell } from "@/components/dashboard-shell";

export default function MembersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
