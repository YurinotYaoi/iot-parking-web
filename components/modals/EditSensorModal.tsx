"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseClient";
import { Button } from "@/components/ui/button";

type SpotDetails = {
  slotName?: string;
  rowNo?: string;
  columnNo?: string;
  floor?: string;
  status?: string;
};

type SensorRow = {
  sensorId: string;
  deviceId: string;
  assigned?: boolean;
  status?: string;
  ownerId?: string;
  spotId?: string;
  spotDetails?: SpotDetails;
};

type Props = {
  sensor: SensorRow | null;
  onClose: () => void;
  onSaved: () => void;
};

const EditSensorModal = ({ sensor, onClose, onSaved }: Props) => {
  const [deviceId, setDeviceId] = useState("");
  const [status, setStatus] = useState("free");
  const [saving, setSaving] = useState(false);
  const [unassigning, setUnassigning] = useState(false);

  useEffect(() => {
    if (!sensor) return;
    setDeviceId(sensor.deviceId || "");
    setStatus(sensor.status || "free");
  }, [sensor]);

  if (!sensor) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");
      const token = await user.getIdToken();

      const res = await fetch(`/api/sensors/${sensor.sensorId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          deviceId,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed to save sensor");

      onSaved();
    } catch (error: any) {
      alert(error.message || "Unable to save sensor");
    } finally {
      setSaving(false);
    }
  };

  const handleUnassign = async () => {
    if (!sensor.spotId) return;

    setUnassigning(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");
      const token = await user.getIdToken();

      const res = await fetch(`/api/sensors/${sensor.sensorId}`, {
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

      const unassignData = await res.json();
      if (!res.ok) throw new Error(unassignData.error || unassignData.message || "Failed to unassign sensor");

      await fetch(`/api/spots/${sensor.spotId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "available" }),
      });

      onSaved();
    } catch (error: any) {
      alert(error.message || "Unable to unassign sensor");
    } finally {
      setUnassigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close edit sensor dialog"
      />

      <div className="relative bg-white p-6 rounded-xl" style={{ width: 420 }}>

        <h2 className="text-xl font-semibold mb-4">Edit Sensor</h2>

        <div className="space-y-3">
          <div>
            <label htmlFor="sensor-id" className="block text-sm font-medium">
              Sensor ID
            </label>
            <p id="sensor-id" className="mt-1 text-sm text-slate-700">
              {sensor.sensorId}
            </p>
          </div>

          <div>
            <label htmlFor="device-id" className="block text-sm font-medium">
              Device ID
            </label>
            <input
              id="device-id"
              className="w-full border p-2 rounded mt-1"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="sensor-status" className="block text-sm font-medium">
              Status
            </label>
            <select
              id="sensor-status"
              className="w-full border p-2 rounded mt-1"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="free">Free</option>
              <option value="occupied">Occupied</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          <div>
            <p className="text-sm text-slate-600">Owner: {sensor.ownerId || "—"}</p>
            <p className="text-sm text-slate-600">Spot: {sensor.spotId || "None"}</p>
            <p className="text-sm text-slate-600">Slot: {sensor.spotDetails?.slotName || "—"}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>

          {sensor.spotId ? (
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleUnassign}
              disabled={unassigning}
            >
              {unassigning ? "Unassigning..." : "Unassign from slot"}
            </Button>
          ) : null}

          <Button variant="outline" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditSensorModal;
