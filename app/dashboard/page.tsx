"use client";

import { Button } from "@/components/ui/button";
import { signOut, onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";
import { IoLogOutOutline , IoSettings } from "react-icons/io5";
import { FaMapLocationDot } from "react-icons/fa6";
import { getUser } from "@/services/user";
import { useEffect, useState } from "react";
import type { UserProfile } from "@/models/user";


import SensorList from "@/components/SensorList";
import CreateSensorModal from "@/components/modals/CreateSensorModal";


export default function DashboardScreen() {

  const router = useRouter();
  //Start of Logout
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };
  //End of Logout

  //Start of User Fetch
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      console.log("firebaseUser", firebaseUser);
      if (!firebaseUser) return;
      try {
        const data = await getUser(firebaseUser.uid);
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    });

    return () => unsub();
  }, []);
  //End of User Fetch

  //CreateSensorModal
  const [showCSModal, setShowCSModal] = useState(false)
  const handleShowCSModal = () => {setShowCSModal(!showCSModal)};

  return (
    <main className="flex flex-col w-full items-center justify-center">
      <div className="w-screen max-w-600 flex flex-rows h-213">

        {showCSModal && <CreateSensorModal handleShowCSModal={handleShowCSModal}/>}

        <div className="w-[30%] p-2">
          <div className="h-full w-full border-2 border-gray-600 rounded-md p-1">
            <div className="p-10">
              {user ? 
              <h1 className="text-center text-3xl">{user.firstName} {user.lastName}</h1> : 
              <h1 className="text-center text-3xl">Loading user...</h1>}
            </div>
            <div className="text-2xl">
              <Button className="w-full rounded-sm justify-start" onClick={handleShowCSModal}>
                <FaMapLocationDot className="!size-5" /> | 
                Location
              </Button>
            </div>
          </div>
        </div>

        <div className="w-[70%] p-2 flex flex-col">
          <div className="h-fit w-full flex border-2 border-gray-600 rounded-md p-1 mb-1 justify-between">
            <div>
              <Button className="rounded-sm mr-1" 
              onClick={handleShowCSModal}>Create Sensor</Button>
              <Button className="rounded-sm" onClick={() => router.push("/dashboard/layout")}>
                Layouts
              </Button>
            </div>
            <div>
              <Button className="rounded-sm mr-1" onClick={() => router.push("/dashboard/settings")}>
                  <IoSettings />
                  Settings
                </Button>
              <Button className="rounded-sm" onClick={handleLogout}>
                <IoLogOutOutline />
                Logout
              </Button>
            </div>
          </div>

          <div className="grow w-full border-2 border-gray-600 rounded-md p-1">
            <SensorList />
          </div>
        </div>
      </div>
    </main>
  );
}