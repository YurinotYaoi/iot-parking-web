"use client";

import { Button } from "@/components/ui/button";
import { signOut, onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";
import { IoLogOutOutline , IoSettings } from "react-icons/io5";
import { FaMapLocationDot , FaTableList } from "react-icons/fa6";
import { getUser } from "@/services/user";
import { useEffect, useState } from "react";
import type { UserProfile } from "@/models/user";

import SensorList from "@/components/SensorList";
import CreateSensorModal from "@/components/modals/CreateSensorModal";
import LocationModal from "@/components/modals/LocationModal";

export default function DashboardScreen() {
    useEffect(() => {
    document.title = "Dashboard";
  }, []);
  
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
    <div className="fp-surface">
      <main className="fp-content flex flex-col w-full items-center justify-center px-3 py-4 sm:px-6">
      <div className="w-full max-w-[1600px] flex flex-col lg:flex-row gap-3 min-h-[calc(100vh-7rem)]">

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
        <div className="w-full lg:w-[30%]">
          <div className="fp-panel h-full w-full p-5">
            <div className="pb-6 mb-2 border-b border-border">
              <p className="fp-eyebrow mb-3">Signed in</p>
              {user ?
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {user.firstName} {user.lastName}
                </h1> :
                <h1 className="text-2xl font-bold tracking-tight text-muted-foreground animate-pulse">
                  Loading user...
                </h1>}
            </div>

            <div className="space-y-4">
              <Button
                className="w-full justify-start"
                onClick={openLocationModal}
              >
                <FaMapLocationDot className="!size-5" /> {user?.location?.name || "Location"}
              </Button>

              {user?.location?.link && (
                <div className="overflow-hidden rounded-lg border border-border">
                  <iframe
                    src={user.location.link}
                    width="100%"
                    height="600"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full lg:w-[70%] flex flex-col gap-3">
          <div className="fp-panel h-fit w-full flex flex-wrap gap-2 p-3 justify-between">
            <div className="flex flex-wrap gap-2">
              <Button onClick={openCSModal}>
                Create Sensor +
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/layout")}
              >
                Layouts
                <FaTableList />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/settings")}
              >
                <IoSettings />
                Settings
              </Button>

              <Button variant="destructive" onClick={handleLogout}>
                <IoLogOutOutline />
                Logout
              </Button>
            </div>
          </div>

          <div className="fp-panel grow w-full overflow-hidden">
            <SensorList />
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}