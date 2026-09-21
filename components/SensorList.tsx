"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/configs/firebaseClient";
import { Button } from "@/components/ui/button";
import EditSpotModal from "@/components/modals/EditSpotModal";
import { Skeleton } from "@/components/Skeleton";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";

type SensorListProps = {
  readonly onCreateSensor?: () => void;
};

type SensorInfo = {
  sensorId: string;
  deviceId: string;
  status?: string;
  assigned?: boolean;
};

type LayoutInfo = {
  layoutName: string;
  gridRow: number | null;
  gridCol: number | null;
};

type SpotRow = {
  slotId: string;
  slotName: string;
  rowNo: string;
  columnNo: string;
  floor: string;
  vehicleType?: string;
  status: string;
  ownerId?: string;
  layoutId?: string;
  lotId?: string;
  sensor?: SensorInfo | null;
  layoutInfo?: LayoutInfo | null;
};

export default function SensorList({ onCreateSensor }: SensorListProps) {
  const [spots, setSpots] = useState<SpotRow[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<SpotRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const fetchSpots = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        if (showLoading) setLoading(false);
        return;
      }

      const token = await user.getIdToken();
      const res = await fetch("/api/spots", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const response = await res.json();
      setSpots(response.data || []);
    } catch (error) {
      console.error("Error fetching spots:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpots();
    const interval = setInterval(() => fetchSpots(false), 5000);
    return () => clearInterval(interval);
  }, []);

  const closeModal = () => setSelectedSpot(null);
  const handleRefresh = () => {
    closeModal();
    fetchSpots();
  };

  return (
    <div className="max-h-[770px] overflow-y-auto rounded font-sans text-sm leading-5 dark:text-slate-100">
      <EditSpotModal spot={selectedSpot} onClose={closeModal} onSaved={handleRefresh} />

      <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/80 px-3 py-3 text-sm dark:border-slate-800 dark:bg-slate-950/50">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800 dark:text-slate-100">Sensors</span>
          {onCreateSensor && (
            <button
              type="button"
              onClick={onCreateSensor}
              className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-white hover:text-slate-900 hover:ring-1 hover:ring-slate-300 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              + Create sensor
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed((collapsed) => !collapsed)}
          className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-expanded={!isCollapsed}
          aria-controls="parking-slots-content"
        >
          {isCollapsed ? "Show sensors" : "Hide sensors"}
          {isCollapsed ? <FaChevronDown aria-hidden="true" /> : <FaChevronUp aria-hidden="true" />}
        </button>
      </div>

      {!isCollapsed && <div id="parking-slots-content">
      <div className="grid grid-cols-5 border-b border-slate-700 bg-slate-800 text-slate-50 dark:border-slate-600 dark:bg-slate-800">
        <div className="p-3 text-xs font-semibold uppercase tracking-wide">Sensor name</div>
        <div className="p-3 text-center text-xs font-semibold uppercase tracking-wide">Layout</div>
        <div className="p-3 text-center text-xs font-semibold uppercase tracking-wide">Status</div>
        <div className="p-3 text-center text-xs font-semibold uppercase tracking-wide">Sensor</div>
        <div className="p-3 text-center text-xs font-semibold uppercase tracking-wide">Action</div>
      </div>

      {loading && (
        <div aria-busy="true" aria-live="polite">
          <span className="sr-only">Loading slots…</span>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="grid grid-cols-5 border-b">
              <div className="p-3"><Skeleton className="h-5 w-20" /></div>
              <div className="p-3 flex justify-center"><Skeleton className="h-5 w-24" /></div>
              <div className="p-3 flex justify-center"><Skeleton className="h-5 w-16" /></div>
              <div className="p-3 flex justify-center"><Skeleton className="h-5 w-20" /></div>
              <div className="p-3 flex justify-center"><Skeleton className="h-8 w-full" /></div>
            </div>
          ))}
        </div>
      )}
      {!loading && spots.length === 0 && (
        <div className="p-4 text-center">No slots found.</div>
      )}
      {!loading && spots.length > 0 &&
        spots.map((spot) => {
          const displayStatus = spot.sensor?.status || spot.status;
          let statusLabel = "Available";
          let statusClass = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300";
          if (displayStatus === "occupied" || displayStatus === "offline") {
            statusLabel = displayStatus === "occupied" ? "Occupied" : "Offline";
            statusClass = "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300";
          } else if (spot.status === "reserved") {
            statusLabel = "Reserved";
            statusClass = "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300";
          } else if (displayStatus === "online") {
            statusLabel = "Online";
            statusClass = "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300";
          }

          return (
            <div key={spot.slotId} className="grid grid-cols-5 border-b border-slate-100 text-sm leading-5 transition-colors odd:bg-white even:bg-slate-50/50 hover:bg-orange-50/70 dark:border-slate-800 dark:odd:bg-slate-900 dark:even:bg-slate-950/40 dark:hover:bg-slate-800/70">
              <div className="p-3 font-medium text-slate-800 dark:text-slate-100">{spot.slotName}</div>
              <div className="p-3 text-center text-slate-600 dark:text-slate-300">{spot.layoutInfo?.layoutName || "-"}</div>
              <div className="flex items-center justify-center p-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
                  {statusLabel}
                </span>
              </div>
              <div className="flex items-center justify-center p-3">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {spot.sensor?.sensorId || "No sensor"}
                </span>
              </div>
              <div className="p-3 flex justify-center">
                <Button className="w-full rounded-lg border border-transparent bg-slate-900 text-sm font-medium text-white shadow-sm transition hover:bg-white hover:text-slate-900 hover:ring-1 hover:ring-slate-300 active:translate-y-px dark:bg-white dark:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white" onClick={() => setSelectedSpot(spot)}>
                  Edit
                </Button>
              </div>
            </div>
          );
        })}
      </div>}
    </div>
  );
}