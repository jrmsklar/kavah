import { DashboardShell } from "@/components/dashboard-shell";

export default function OverviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
