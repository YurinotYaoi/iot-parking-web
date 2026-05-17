"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseClient";
import { Button } from "@/components/ui/button";

type SensorInfo = {
  sensorId: string;
  deviceId: string;
  status?: string;
  assigned?: boolean;
};

type LayoutInfo = {
  layoutName?: string;
  gridRow?: number | null;
  gridCol?: number | null;
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

type Props = {
  spot: SpotRow | null;
  onClose: () => void;
  onSaved: () => void;
};

const EditSpotModal = ({ spot, onClose, onSaved }: Props) => {
  const [slotName, setSlotName] = useState("");
  const [vehicleType, setVehicleType] = useState("any");
  const [rowNo, setRowNo] = useState("");
  const [columnNo, setColumnNo] = useState("");
  const [floor, setFloor] = useState("");
  const [saving, setSaving] = useState(false);
  const [unassigning, setUnassigning] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!spot) return;
    setSlotName(spot.slotName || "");
    setVehicleType(spot.vehicleType || "any");
    setRowNo(spot.rowNo || "");
    setColumnNo(spot.columnNo || "");
    setFloor(spot.floor || "");
  }, [spot]);

  if (!spot) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");
      const token = await user.getIdToken();

      const res = await fetch(`/api/spots/${spot.slotId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slotName,
          vehicleType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed to save slot");

      onSaved();
    } catch (error: any) {
      alert(error.message || "Unable to save slot");
    } finally {
      setSaving(false);
    }
  };

  const handleUnassign = async () => {
    if (!spot.sensor?.sensorId) return;
    setUnassigning(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");
      const token = await user.getIdToken();

      const sensorRes = await fetch(`/api/sensors/${spot.sensor.sensorId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          spotId: "",
          assigned: false,
        }),
      });
      const sensorData = await sensorRes.json();
      if (!sensorRes.ok) throw new Error(sensorData.error || sensorData.message || "Failed to unassign sensor");

      const spotRes = await fetch(`/api/spots/${spot.slotId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "available",
        }),
      });
      const spotData = await spotRes.json();
      if (!spotRes.ok) throw new Error(spotData.error || spotData.message || "Failed to update slot status");

      onSaved();
    } catch (error: any) {
      alert(error.message || "Unable to unassign sensor");
    } finally {
      setUnassigning(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");
      const token = await user.getIdToken();

      if (spot.sensor?.sensorId) {
        const sensorRes = await fetch(`/api/sensors/${spot.sensor.sensorId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            spotId: "",
            assigned: false,
          }),
        });
        const sensorData = await sensorRes.json();
        if (!sensorRes.ok) throw new Error(sensorData.error || sensorData.message || "Failed to unassign sensor");
      }

      const deleteRes = await fetch(`/api/spots/${spot.slotId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const deleteData = await deleteRes.json();
      if (!deleteRes.ok) throw new Error(deleteData.error || deleteData.message || "Failed to delete spot");

      onSaved();
      onClose();
    } catch (error: any) {
      alert(error.message || "Unable to delete spot");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close edit slot dialog"
      />

      <div className="fp-panel relative bg-card text-card-foreground p-6 w-full max-w-[420px]">
        <h2 className="text-xl font-bold tracking-tight mb-5">Edit Slot</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="slot-name" className="block text-sm font-medium mb-1.5 text-foreground">
              Slot Name
            </label>
            <input
              id="slot-name"
              className="w-full rounded-lg border border-input bg-background p-2.5 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              value={slotName}
              onChange={(e) => setSlotName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="vehicle-type" className="block text-sm font-medium mb-1.5 text-foreground">
              Vehicle Type
            </label>
            <input
              id="vehicle-type"
              className="w-full rounded-lg border border-input bg-background p-2.5 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg border border-border bg-muted/50 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Floor</div>
              <div className="mt-1 text-base text-foreground">{floor || "—"}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Row</div>
              <div className="mt-1 text-base text-foreground">{rowNo || "—"}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Column</div>
              <div className="mt-1 text-base text-foreground">{columnNo || "—"}</div>
            </div>
          </div>

          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Device Id: {spot.sensor?.deviceId || "None"}</p>
            <p>Owner: {spot.ownerId || "—"}</p>
            <p>Layout: {spot.layoutInfo?.layoutName || spot.layoutId || "—"}</p>
            <p>Grid Row: {(spot.layoutInfo?.gridRow ?? spot.rowNo) || "—"}</p>
            <p>Grid Col: {(spot.layoutInfo?.gridCol ?? spot.columnNo) || "—"}</p>
            <p>Lot ID: {spot.lotId || "—"}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>

          <Button
            variant="destructive"
            className="w-full"
            onClick={handleDelete}
            disabled={deleting || saving || unassigning}
          >
            {deleting ? "Deleting..." : "Delete slot"}
          </Button>

          <Button variant="outline" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditSpotModal;
