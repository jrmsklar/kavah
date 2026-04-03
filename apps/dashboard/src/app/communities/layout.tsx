import { DashboardShell } from "@/components/dashboard-shell";

export default function CommunitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
