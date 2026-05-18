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
        <div className="w-screen flex flex-col">
          <div className="p-2 flex flex-col">
            <div className="h-fit w-full flex border-2 border-gray-800 rounded-md p-1">
              <Button onClick={() => router.push("/dashboard")} className="shadow-md active:shadow-inner active:translate-y-px rounded-sm bg-black text-white hover:bg-white hover:text-black hover:border-black border border-transparent dark:bg-white dark:text-black dark:hover:bg-slate-800 dark:hover:text-white dark:hover:border-slate-800 ">
                <FaArrowLeft className="mr-2" />
                Back
              </Button>
              <Button className="shadow-md active:shadow-inner active:translate-y-px rounded-sm bg-black text-white hover:bg-white hover:text-black hover:border-black border border-transparent dark:bg-white dark:text-black dark:hover:bg-slate-800 dark:hover:text-white dark:hover:border-slate-800 " onClick={() => router.push("/dashboard/createlayout")}>
                + Create Layout
              </Button>
            </div>
          </div>

          
          <div className="w-full p-2 pt-0 height-auto grow">
            <div className="border-2 flex border-2 border-gray-800 rounded-md mb-1 flex flex-col h-full">
              <div className="flex-1 overflow-y-auto">
                <LayoutList key={refreshKey} lotId="default-lot-id" onRefresh={handleRefresh} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}