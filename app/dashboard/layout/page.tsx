"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa6";
import LayoutList from "@/components/layout/LayoutList";
import { Suspense, useEffect, useState, useTransition } from "react";
import { Skeleton } from "@/components/Skeleton";
import { Spinner } from "@/components/Spinner";

// Skeleton fallback that mimics the exact table structure of LayoutList
function LayoutListSkeleton() {
  return (
    <div
      className="max-h-[770px] overflow-y-auto rounded dark:text-slate-100"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading layouts…</span>

      {/* Top bar */}
      <div className="flex items-center justify-between gap-2 border-b bg-gray-100 px-3 py-2 text-sm dark:bg-gray-900">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-36" />
      </div>

      {/* Column header row */}
      <div className="grid grid-cols-5 border-b bg-gray-100 dark:bg-gray-900">
        <div className="p-3"><Skeleton className="h-4 w-12" /></div>
        <div className="p-3 flex justify-center"><Skeleton className="h-4 w-10" /></div>
        <div className="p-3 flex justify-center"><Skeleton className="h-4 w-12" /></div>
        <div className="p-3 flex justify-center"><Skeleton className="h-4 w-16" /></div>
        <div className="p-3 flex justify-center"><Skeleton className="h-4 w-14" /></div>
      </div>

      {/* Data rows */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="grid grid-cols-5 border-b">
          <div className="p-3"><Skeleton className="h-5 w-24" /></div>
          <div className="p-3 flex justify-center"><Skeleton className="h-5 w-16" /></div>
          <div className="p-3 flex justify-center"><Skeleton className="h-5 w-20" /></div>
          <div className="p-3 flex justify-center"><Skeleton className="h-5 w-20" /></div>
          <div className="p-3 flex justify-center gap-2">
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LayoutsScreen() {
  useEffect(() => {
    document.title = "Layouts";
  }, []);

  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  // useTransition gives us a pending flag for navigation actions —
  // perfect for showing a spinner on the "Create Layout" button until the
  // next route's loading.tsx (or page) actually starts rendering.
  const [isNavigating, startTransition] = useTransition();
  const [navTarget, setNavTarget] = useState<string | null>(null);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const navigateTo = (path: string) => {
    setNavTarget(path);
    startTransition(() => {
      router.push(path);
    });
  };

  const isBackNav = isNavigating && navTarget === "/dashboard";
  const isCreateNav = isNavigating && navTarget === "/dashboard/createlayout";

  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-slate-50/70 dark:bg-slate-950">
      <div className="flex w-screen max-w-6xl flex-col px-4 py-6">
        <div className="flex w-full flex-col">
          <div className="mb-5 flex flex-col">
            <div className="flex h-fit w-full gap-2 rounded-xl border border-slate-200 bg-white/80 p-2 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
              <Button
                onClick={() => navigateTo("/dashboard")}
                disabled={isNavigating}
                className="rounded-lg border border-transparent bg-slate-900 text-white shadow-sm transition hover:bg-white hover:text-slate-900 hover:ring-1 hover:ring-slate-300 active:translate-y-px disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                {isBackNav ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner size="sm" label="Going back" />
                    Loading…
                  </span>
                ) : (
                  <>
                    <FaArrowLeft className="mr-2" />
                    Back
                  </>
                )}
              </Button>
              <Button
                onClick={() => navigateTo("/dashboard/createlayout")}
                disabled={isNavigating}
                className="rounded-lg border border-transparent bg-slate-900 text-white shadow-sm transition hover:bg-white hover:text-slate-900 hover:ring-1 hover:ring-slate-300 active:translate-y-px disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                {isCreateNav ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner size="sm" label="Opening create layout" />
                    Opening…
                  </span>
                ) : (
                  "+ Create Layout"
                )}
              </Button>
            </div>
          </div>

          <div className="h-auto w-full grow">
            <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
              <div className="flex-1 overflow-y-auto">
                {/*
                  Suspense will show LayoutListSkeleton as the fallback IF
                  LayoutList suspends (e.g. via `use()` or a Suspense-aware
                  data lib like SWR/React Query with `suspense: true`).
                  If LayoutList currently fetches via useEffect+useState,
                  the skeleton work needs to happen INSIDE that component —
                  see the note below the file.
                */}
                <Suspense fallback={<LayoutListSkeleton />}>
                  <LayoutList
                    key={refreshKey}
                    lotId="default-lot-id"
                    onRefresh={handleRefresh}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}