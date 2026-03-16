import { Button } from "@/components/ui/button";
import React from "react";

export default function DashboardScreen() {
  return (
    <main className="flex flex-col min-h-screen w-full items-center justify-center py-32 px-16
    bg-white dark:bg-black">
      <div className="min-w-screen flex flex-row w-full h-96 bg-gray-300">
        <div className="w-[30%] p-3 bg-amber-300">
          left
        </div>
        <div className="w-[70%] p-3 bg-amber-800">
          <div className="w-full bg-amber-500">
            <Button>Create Sensor</Button>
            <Button>Layouts</Button>
          </div>
          right
        </div>
      </div>
    </main>
  );
}