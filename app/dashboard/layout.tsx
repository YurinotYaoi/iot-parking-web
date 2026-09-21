import AuthGuard from "@/components/AuthGuard";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AuthGuard>{children}</AuthGuard>;
}