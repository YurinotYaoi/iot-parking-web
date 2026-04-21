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
import LocationModal from "@/components/modals/LocationModal";

export default function DashboardScreen() {
  const router = useRouter();

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  // User Fetch
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
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

  // MODAL FIX (IMPORTANT)
  const [showCSModal, setShowCSModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const openCSModal = () => setShowCSModal(true);
  const closeCSModal = () => setShowCSModal(false);

  const openLocationModal = () => setShowLocationModal(true);
  const closeLocationModal = () => setShowLocationModal(false);

  const handleSaveLocation = async (name: string, link: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      await fetch('/api/users/location', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, link }),
      });
      // Refresh user data
      if (auth.currentUser) {
        const data = await getUser(auth.currentUser.uid);
        setUser(data);
      }
    } catch (err) {
      console.error('Failed to save location:', err);
    }
  };

  return (
    <main className="flex flex-col w-full items-center justify-center">
      <div className="w-screen max-w-600 flex flex-rows h-213">

        {/* Modal */}
        {showCSModal && (
          <CreateSensorModal onClose={closeCSModal} />
        )}
        {showLocationModal && (
          <LocationModal
            onClose={closeLocationModal}
            onSave={handleSaveLocation}
            initialName={user?.location?.name || ""}
            initialLink={user?.location?.link || ""}
          />
        )}

        {/* LEFT PANEL */}
        <div className="w-[30%] p-2">
          <div className="h-full w-full border-2 border-gray-800 rounded-md p-1">
            <div className="p-10">
              {user ? 
                <h1 className="text-center text-3xl">
                  {user.firstName} {user.lastName}
                </h1> : 
                <h1 className="text-center text-3xl">
                  Loading user...
                </h1>}
            </div>

            <div className="text-2xl">
              <Button
                className="w-full rounded-sm justify-start bg-gray-900 dark:bg-slate-100"
                onClick={openLocationModal}
              >
                <FaMapLocationDot className="!size-5" /> | {user?.location?.name || "Location"}
              </Button>

              {user?.location?.link && (
                <div className="mt-4">
                  <iframe
                    src={user.location.link}
                    width="100%"
                    height="600"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-md"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-[70%] p-2 flex flex-col">
          <div className="h-fit w-full flex border-2 border-gray-800 rounded-md p-1 mb-1 justify-between">
            <div>
              <Button className="rounded-sm mr-1 bg-gray-900 dark:bg-slate-100" onClick={openCSModal}>
                Create Sensor
              </Button>

              <Button
                className="rounded-sm bg-gray-900 dark:bg-slate-100"
                onClick={() => router.push("/dashboard/layout")}
              >
                Layouts
              </Button>
            </div>

            <div>
              <Button
                className="rounded-sm mr-1 bg-gray-900 dark:bg-slate-100"
                onClick={() => router.push("/dashboard/settings")}
              >
                <IoSettings />
                Settings
              </Button>

              <Button className="rounded-sm bg-gray-900 dark:bg-slate-100" onClick={handleLogout}>
                <IoLogOutOutline />
                Logout
              </Button>
            </div>
          </div>

          <div className="grow w-full border-2 border-gray-800 rounded-md">
            <SensorList />
          </div>
        </div>
      </div>
    </main>
  );
}