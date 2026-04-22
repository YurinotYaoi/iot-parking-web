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
    <main className="flex flex-col w-full items-center justify-center">
      <div className="w-screen max-w-600 flex flex-rows h-213">
        <div className="w-full p-2">
          <div className="border-2 border-gray-600 h-full w-full rounded-md p-4 flex flex-col">
            <div className="w-full flex gap-2 mb-4">
              <Button onClick={() => router.push("/dashboard")} className="rounded-sm">
                <FaArrowLeft className="mr-2" />
                Back
              </Button>
              <Button className="rounded-sm" onClick={() => router.push("/dashboard/createlayout")}>
                + Create Layout
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <LayoutList key={refreshKey} lotId="default-lot-id" onRefresh={handleRefresh} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}