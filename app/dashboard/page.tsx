"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";

export default function DashboardScreen() {
  const router = useRouter();
  
  const handleLogout = async () => {
    router.push("/");
    await signOut(auth);
  };

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
            <Button onClick={handleLogout}>Logout</Button>
          </div>
          right
        </div>
      </div>
    </main>
  );
}