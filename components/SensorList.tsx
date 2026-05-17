"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseClient";
import { Button } from "./ui/button";
import EditSpotModal from "@/components/modals/EditSpotModal";

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

export default function SensorList() {
  const [spots, setSpots] = useState<SpotRow[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<SpotRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

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
      setLastUpdated(new Date().toLocaleTimeString());
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
    <div className="max-h-[calc(100vh-12rem)] overflow-y-auto text-foreground">
      <EditSpotModal spot={selectedSpot} onClose={closeModal} onSaved={handleRefresh} />

      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-border
      bg-card/95 px-4 py-3 text-sm backdrop-blur">
        <span className="font-semibold tracking-tight">Parking slots</span>
        <span className="text-xs text-muted-foreground">Auto-refresh every 5s · last updated {lastUpdated || "—"}</span>
      </div>

      <div className="grid grid-cols-7 border-b border-border
      bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <div className="p-3">Slot Name</div>
        <div className="p-3 text-center">Layout Name</div>
        <div className="p-3 text-center">Grid Column</div>
        <div className="p-3 text-center">Grid Row</div>
        <div className="p-3 text-center">Status</div>
        <div className="p-3 text-center">Sensor</div>
        <div className="p-3 text-center">Action</div>
      </div>

      {loading && (
        <div className="col-span-7 p-6 text-center text-sm text-muted-foreground">Loading slots...</div>
      )}
      {!loading && spots.length === 0 && (
        <div className="p-6 text-center text-sm text-muted-foreground">No slots found.</div>
      )}
      {!loading && spots.length > 0 &&
        spots.map((spot) => {
          const displayStatus = spot.sensor?.status || spot.status;
          let statusDisplay = "🟢 Available";
          if (displayStatus === "occupied" || displayStatus === "offline") {
            statusDisplay = "🔴 " + (displayStatus === "occupied" ? "Occupied" : "Offline");
          } else if (displayStatus === "online") {
            statusDisplay = "🟡 Online";
          }

          return (
            <div key={spot.slotId} className="grid grid-cols-7 border-b border-border text-sm
            transition-colors hover:bg-accent/40">
              <div className="p-3 font-medium">{spot.slotName}</div>
              <div className="p-3 text-center text-muted-foreground">{spot.layoutInfo?.layoutName || "-"}</div>
              <div className="p-3 text-center text-muted-foreground">{spot.layoutInfo?.gridCol || "-"}</div>
              <div className="p-3 text-center text-muted-foreground">{spot.layoutInfo?.gridRow || "-"}</div>
              <div className="p-3 text-center">{statusDisplay}</div>
              <div className="p-3 text-center text-muted-foreground">{spot.sensor?.sensorId || "None"}</div>
              <div className="p-3 flex justify-center">
                <Button size="sm" variant="outline" className="w-full" onClick={() => setSelectedSpot(spot)}>
                  Edit
                </Button>
              </div>
            </div>
          );
        })}
    </div>
  );
}