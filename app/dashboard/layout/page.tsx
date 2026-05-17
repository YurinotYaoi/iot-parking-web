"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa6";
import LayoutList from "@/components/layout/LayoutList";
import { useEffect, useState } from "react";

export default function LayoutsScreen() {

    useEffect(() => {
    document.title = "Layouts";
  }, []);
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="fp-surface">
      <main className="fp-content flex flex-col w-full items-center justify-center px-3 py-4 sm:px-6">
      <div className="w-full max-w-[1600px] flex flex-col gap-3 min-h-[calc(100vh-7rem)]">
        <div className="fp-panel h-fit w-full flex flex-wrap gap-2 p-3">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            <FaArrowLeft className="mr-1" />
            Back
          </Button>
          <Button onClick={() => router.push("/dashboard/createlayout")}>
            + Create Layout
          </Button>
        </div>

        <div className="fp-panel w-full grow flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <LayoutList key={refreshKey} lotId="default-lot-id" onRefresh={handleRefresh} />
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}