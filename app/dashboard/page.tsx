"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";
import SensorList from "@/components/SensorList"

export default function DashboardScreen() {
  const router = useRouter();
  
  const handleLogout = async () => {
    router.push("/");
    await signOut(auth);
  };

  return (
    <main className="flex flex-col w-full items-center justify-center">
      <div className="w-screen max-w-600 flex flex-rows h-213">
        <div className="w-[30%] p-2">
          <div className="h-full w-full border-2 border-gray-600 rounded-md p-1">
           <div className="bg-black">
            <h1 className="">Account Name</h1>
           </div>
           <div className="bg-red-200">

           </div>
          </div>
        </div>
        
        <div className="w-[70%] p-2 flex flex-col">
          <div className="h-fit w-full flex border-2 border-gray-600 rounded-md p-1 mb-1 justify-between">
            <div>
            <Button className="rounded-sm">
              Create Sensor</Button>
            <Button className="rounded-sm">
              Layouts</Button>
            </div>
            <Button className="rounded-sm"
            onClick={handleLogout}>Logout</Button>
          </div>

          <div className="flex-grow w-full border-2 border-gray-600 rounded-md p-1">
            <SensorList></SensorList>
          </div>
        </div>
      </div>
    </main>
  );
}