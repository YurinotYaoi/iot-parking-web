"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseClient";

type Props = {
  onClose: () => void;
};

type Sensor = {
  sensorId: string;
  deviceId: string;
  name: string; // unique sensor name
  spotId?: string;
};

export default function CreateSensorModal({ onClose }: Props) {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [slotName, setSlotName] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [selectedSensor, setSelectedSensor] = useState("");
  const [loading, setLoading] = useState(false);

  // Grid values will be assigned later by layout management
  const rowNo = undefined;
  const columnNo = undefined;
  const layoutId = undefined;
  const lotId = undefined;
  const floor = undefined;

  // Fetch available sensors
  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();
        const res = await fetch("/api/sensors", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        // only show sensors that are available (not assigned)
        const availableSensors = (data.data || []).filter((s: Sensor) => !s.spotId);
        setSensors(availableSensors);
      } catch (err) {
        console.error("Error fetching sensors:", err);
      }
    };
    fetchSensors();
  }, []);

  const handleCreateAndAssign = async () => {
    if (!slotName || !vehicleType || !selectedSensor) {
      alert("Fill all fields and select a sensor");
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");
      const token = await user.getIdToken();

      // 1️⃣ Create spot using the new route
      const createRes = await fetch("/api/spots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slotName,
          vehicleType,
          rowNo,
          columnNo,
          layoutId,
          lotId,
          floor,
          ownerId: user.uid, // assign to current user
        }),
      });

      const slotData = await createRes.json();
      if (!createRes.ok) throw new Error(slotData.message || "Failed to create spot");

      const spotId = slotData.data.id || slotData.data.slotId;

      // 2️⃣ Assign sensor to the new spot
      const assignRes = await fetch(`/api/sensors/${selectedSensor}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          spotId,
          ownerId: user.uid,
          assigned: true,
        }),
      });

      const assignedSensor = await assignRes.json();
      if (!assignRes.ok) throw new Error(assignedSensor.message || "Failed to assign sensor");

      // 3️⃣ Update spot status to occupied
      const updateSpotRes = await fetch(`/api/spots/${spotId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "occupied",
        }),
      });

      const updatedSpot = await updateSpotRes.json();
      if (!updateSpotRes.ok) throw new Error(updatedSpot.message || "Failed to update spot status");

      alert("Slot created & sensor assigned!");
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onMouseDown={onClose}
    >
      <div
        className="bg-white p-6 rounded-xl w-[400px]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Create Slot & Assign Sensor</h2>

        <label className="block mb-1 text-sm">Slot Name</label>
        <input
          className="w-full border p-2 rounded mb-2"
          value={slotName}
          onChange={(e) => setSlotName(e.target.value)}
        />

        <label className="block mb-1 text-sm">Vehicle Type</label>
        <input
          className="w-full border p-2 rounded mb-4"
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
        />

        <label className="block mb-2 text-sm">Select Sensor</label>
        <select
          className="w-full border p-2 mb-4 rounded"
          value={selectedSensor}
          onChange={(e) => setSelectedSensor(e.target.value)}
        >
          <option value="">-- Select Sensor --</option>
          {sensors.map((s) => (
            <option key={s.sensorId} value={s.sensorId}>
              {s.name ? `${s.name} (${s.sensorId})` : `${s.deviceId} (${s.sensorId})`}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleCreateAndAssign}
            disabled={loading}
          >
            {loading ? "Saving..." : "Create & Assign"}
          </button>
        </div>
      </div>
    </div>
  );
}