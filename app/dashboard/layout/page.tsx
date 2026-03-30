"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa6";

export default function LayoutsScreen() {
  const router = useRouter();
  return (
    <main className="flex flex-col w-full items-center justify-center">
      <div className="w-screen max-w-600 flex flex-rows h-213">
        <div className="w-full p-2">
          <div className="border-2 border-gray-600 h-full w-full rounded-md p-1 flex flex-col">
            <div className="w-full flex mb-1">
              <Button onClick={() => router.push("/dashboard")} className="mr-1 rounded-sm">
                <FaArrowLeft />
                Back
              </Button>
              <Button className="rounded-sm" onClick={() => router.push("/dashboard/createlayout")}>
                Create Layout
              </Button>
            </div>

            <div className="bg-amber-700 grow">
              bottom
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}