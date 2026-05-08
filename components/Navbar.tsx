"use client";

import ThemeToggle from "./ui/theme-toggle";
import { useRouter, usePathname } from "next/navigation";
import { logoutUser } from "@/services/logout";
import Link from "next/link";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  // Hide navbar only on auth pages (they have their own brand panel)
  const hiddenRoutes = ["/auth/login", "/auth/signup"];
  if (hiddenRoutes.includes(pathname)) {
    return null;
  }

  const isDashboard = pathname?.startsWith("/dashboard");

  const handleHomeClick = async () => {
    await logoutUser();
    router.push("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-16">
        {/* Brand */}
        <span
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white shadow-md shadow-blue-700/20 transition-transform group-hover:scale-105">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
            </svg>
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            FlexPark
          </span>
        </span>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!isDashboard && (
            <>
              <div className="ml-2 hidden h-6 w-px bg-slate-200 dark:bg-slate-800 sm:block" />
              <Link
                href="/auth/login"
                className="hidden rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:inline-block dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-3 py-1.5 text-sm font-semibold text-white shadow-md shadow-blue-700/20 transition-all hover:bg-blue-800 hover:shadow-lg hover:shadow-blue-700/30 active:translate-y-px"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;