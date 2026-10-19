"use client";

import { Button } from "@/components/ui/button";
import { signOut, onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/configs/firebaseClient";
import { useRouter } from "next/navigation";
import { IoLogOutOutline, IoSettings } from "react-icons/io5";
import { FaCircleUser, FaMapLocationDot, FaTableList, FaClock } from "react-icons/fa6";
import { getUser } from "@/services/user";
import { useEffect, useState } from "react";
import type { UserProfile } from "@/models/user";
import { toast } from "sonner";

import SensorList from "@/components/SensorList";
import LayoutPreview from "@/components/layout/LayoutPreview";
import CreateSensorModal from "@/components/modals/CreateSensorModal";
import LocationModal from "@/components/modals/LocationModal";
import { Skeleton } from "@/components/Skeleton";
import { Spinner } from "@/components/Spinner";
import type { GridType } from "@/models/layout";

type DashboardLayout = {
  layoutId: string;
  layoutName: string;
  grid: GridType;
};

type DashboardSpot = {
  slotId: string;
  layoutId?: string;
  slotName?: string;
  vehicleType?: string;
  status?: string;
  sensor?: {
    status?: string;
  } | null;
};

export default function DashboardScreen() {
  useEffect(() => {
    document.title = "Dashboard";
  }, []);

  const router = useRouter();

  // ── State ──────────────────────────────────────────────────────────────
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true); // 1. loading state
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [layouts, setLayouts] = useState<DashboardLayout[]>([]);
  const [selectedLayoutId, setSelectedLayoutId] = useState("");
  const [layoutsLoading, setLayoutsLoading] = useState(true);
  const [liveSpots, setLiveSpots] = useState<DashboardSpot[]>([]);

  const [showCSModal, setShowCSModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // ── Auth + user fetch ──────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (!firebaseUser) {
        setIsUserLoading(false);
        return;
      }
      try {
        const data = await getUser(firebaseUser.uid);
        setUser(data);

        const token = await firebaseUser.getIdToken();
        const layoutsResponse = await fetch("/api/layouts?lotId=default-lot-id", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const layoutsJson = await layoutsResponse.json();
        const availableLayouts = Array.isArray(layoutsJson?.data)
          ? layoutsJson.data.filter((layout: DashboardLayout) => Array.isArray(layout.grid))
          : [];
        setLayouts(availableLayouts);
        setSelectedLayoutId((currentId) => currentId || availableLayouts[0]?.layoutId || "");
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setIsUserLoading(false);
        setLayoutsLoading(false);
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    let refreshTimer: number | undefined;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setLiveSpots([]);
        if (refreshTimer) window.clearInterval(refreshTimer);
        return;
      }

      const refreshSpots = async () => {
        try {
          const token = await firebaseUser.getIdToken();
          const response = await fetch("/api/spots", {
            cache: "no-store",
            headers: { Authorization: `Bearer ${token}` },
          });
          const json = await response.json();
          if (response.ok && Array.isArray(json?.data)) {
            setLiveSpots(json.data);
          }
        } catch (error) {
          console.error("Failed to refresh dashboard parking condition:", error);
        }
      };

      refreshSpots();
      refreshTimer = window.setInterval(refreshSpots, 5000);
    });

    return () => {
      unsubscribe();
      if (refreshTimer) window.clearInterval(refreshTimer);
    };
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
      setIsLoggingOut(false);
    }
  };

  //helper functions
  const openCSModal = () => setShowCSModal(true);
  const closeCSModal = () => setShowCSModal(false);
  const openLocationModal = () => setShowLocationModal(true);
  const closeLocationModal = () => setShowLocationModal(false);

  const handleSaveLocation = async (name: string, link: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      await fetch("/api/users/location", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, link }),
      });
      if (auth.currentUser) {
        const data = await getUser(auth.currentUser.uid);
        setUser(data);
      }
      toast.success("Location saved!");
    } catch {
      toast.error("Failed to save location");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-slate-50/70 dark:bg-slate-950">
      <div className="grid w-screen max-w-6xl grid-cols-1 items-start gap-4 px-4 py-6 lg:grid-cols-[minmax(220px,0.8fr)_minmax(0,2.2fr)]">

        {/* Modals */}
        {showCSModal && <CreateSensorModal onClose={closeCSModal} />}
        {showLocationModal && (
          <LocationModal
            onClose={closeLocationModal}
            onSave={handleSaveLocation}
            initialName={user?.location?.name || ""}
            initialLink={user?.location?.link || ""}
          />
        )}

        {/* LEFT PANEL */}
        <div className="w-full">
          <div className="h-fit w-full overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-1 shadow-md shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-none">
            <div className="p-5">
              {isUserLoading ? (
                // Skeleton placeholder for the user name
                <div className="flex justify-center" aria-busy="true" aria-live="polite">
                  <span className="sr-only">Loading user…</span>
                  <Skeleton className="h-9 w-48" />
                </div>
              ) : user ? (
                <div className="flex items-center gap-3">
                  <FaCircleUser className="size-12 shrink-0 text-orange-500 dark:text-orange-400" aria-hidden="true" />
                  <div className="min-w-0">
                    <h1 className="truncate text-xl font-bold text-slate-900 dark:text-white" title={`${user.firstName} ${user.lastName}`}>
                      {user.firstName} {user.lastName}
                    </h1>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-slate-500">
                  <FaCircleUser className="size-12 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em]">Welcome</p>
                    <h1 className="text-xl font-bold">Admin</h1>
                  </div>
                </div>
              )}
            </div>

            <div className="text-2xl">
              <Button
                className="w-full min-w-0 justify-start rounded-lg border border-transparent bg-slate-900 text-white shadow-sm transition hover:bg-white hover:text-slate-900 hover:ring-1 hover:ring-slate-300 active:translate-y-px dark:bg-white dark:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                onClick={openLocationModal}
                disabled={isUserLoading}
                title={user?.location?.name || "Set parking location"}
              >
                <FaMapLocationDot className="mr-2 size-5 shrink-0" />
                <span className="truncate">{user?.location?.name || "Set parking location"}</span>
              </Button>

              {isUserLoading ? (
                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-950">
                  <div className="mb-2 flex items-center gap-2 px-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  </div>
                    <Skeleton className="h-[280px] w-full rounded-lg" />
                </div>
              ) : (
                user?.location?.link && (
                  <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2 shadow-sm dark:border-slate-700 dark:bg-slate-950">
                    <div className="mb-2 flex items-center justify-between px-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400"></span>
                    </div>
                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                      <iframe
                        src={user.location.link}
                        width="100%"
                        height="280"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Parking location map"
                        className="block"
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex w-full min-w-0 flex-col">
          <div className="mb-3 flex h-fit w-full flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white/80 p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex flex-wrap gap-1">
              <Button
                className="rounded-lg border border-transparent bg-slate-900 text-white shadow-sm transition hover:bg-white hover:text-slate-900 hover:ring-1 hover:ring-slate-300 active:translate-y-px dark:bg-white dark:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                onClick={() => router.push("/dashboard/layout")}
              >
                Layouts
                <FaTableList />
              </Button>

              <Button
                className="mr-1 rounded-lg border border-transparent bg-slate-900 text-white shadow-sm transition hover:bg-white hover:text-slate-900 hover:ring-1 hover:ring-slate-300 active:translate-y-px dark:bg-white dark:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                onClick={() => router.push("/dashboard/sensorHistory")}
              >
                Sensor History
                <FaClock />
              </Button>
            </div>

            <div className="flex flex-wrap gap-1">
              <Button
                className="mr-1 rounded-lg border border-transparent bg-slate-900 text-white shadow-sm transition hover:bg-white hover:text-slate-900 hover:ring-1 hover:ring-slate-300 active:translate-y-px dark:bg-white dark:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                onClick={() => router.push("/dashboard/settings")}
              >
                <IoSettings />
                Settings
              </Button>

              <Button
                className="rounded-lg border border-transparent bg-slate-900 text-white shadow-sm transition hover:bg-white hover:text-slate-900 hover:ring-1 hover:ring-slate-300 active:translate-y-px dark:bg-white dark:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <Spinner size="sm" label="Logging out" />
                    Logging out…
                  </>
                ) : (
                  <>
                    <IoLogOutOutline />
                    Logout
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
            <section className="border-b border-slate-200 p-3 dark:border-slate-800">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Parking condition</h2>
                </div>
                {!layoutsLoading && layouts.length > 0 && (
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                    Layout
                    <select
                      value={selectedLayoutId}
                      onChange={(event) => setSelectedLayoutId(event.target.value)}
                      aria-label="Choose parking layout"
                      className="max-w-40 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm dark:border-slate-600 dark:bg-slate-800"
                    >
                      {layouts.map((layout) => (
                        <option key={layout.layoutId} value={layout.layoutId}>
                          {layout.layoutName}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              {layoutsLoading ? (
                <div className="flex h-20 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-400">
                  Loading layout...
                </div>
              ) : layouts.length > 0 ? (
                (() => {
                  const selectedLayout = layouts.find((layout) => layout.layoutId === selectedLayoutId);
                  return selectedLayout ? (
                    <LayoutPreview
                      layoutName={selectedLayout.layoutName}
                      grid={selectedLayout.grid}
                      liveSpots={liveSpots.filter((spot) => spot.layoutId === selectedLayout.layoutId)}
                      onEdit={() => router.push(`/dashboard/editlayout?id=${selectedLayout.layoutId}`)}
                    />
                  ) : null;
                })()
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-400">
                  No layout is available to preview yet.
                </div>
              )}
            </section>
            <SensorList onCreateSensor={openCSModal} />
          </div>
        </div>
      </div>
    </main>
  );
}