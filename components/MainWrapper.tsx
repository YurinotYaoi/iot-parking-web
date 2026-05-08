"use client";

import { usePathname } from "next/navigation";

const authRoutes = ["/auth/login", "/auth/signup"];

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = authRoutes.includes(pathname);

  return (
    <main className={isAuth ? "" : "pt-16"}>
      {children}
    </main>
  );
}
