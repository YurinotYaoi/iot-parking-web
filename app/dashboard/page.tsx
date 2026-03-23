"use client";

import { Button } from "@/components/ui/button";
import { signOut, onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";
import SensorList from "@/components/SensorList";
import { IoLogOutOutline } from "react-icons/io5";
import { getUser } from "@/services/user";
import { useEffect, useState } from "react";
import type { UserProfile } from "@/models/user";

export default function DashboardScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

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

  return (
    <main className="flex flex-col w-full items-center justify-center">
      <div className="w-screen max-w-600 flex flex-rows h-213">
        <div className="w-[30%] p-2">
          <div className="h-full w-full border-2 border-gray-600 rounded-md p-1">
            <div className="bg-black text-white p-2">
              {user ? <h1>{user.firstName} {user.lastName}</h1> : <p>Loading user...</p>}
            </div>
            <div className="bg-red-200"></div>
          </div>
        </div>

        <div className="w-[70%] p-2 flex flex-col">
          <div className="h-fit w-full flex border-2 border-gray-600 rounded-md p-1 mb-1 justify-between">
            <div>
              <Button className="rounded-sm mr-1">Create Sensor</Button>
              <Button className="rounded-sm">Layouts</Button>
            </div>
            <Button className="rounded-sm" onClick={handleLogout}>
              <IoLogOutOutline />
              Logout
            </Button>
          </div>

          <div className="flex-grow w-full border-2 border-gray-600 rounded-md p-1">
            <SensorList />
          </div>
        </div>
      </div>
    </main>
  );
}