"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/configs/firebaseClient";
import { Skeleton } from "@/components/Skeleton";

export type AvailableSensor = {
  sensorId: string;
  deviceId: string;
  status?: string;
  spotId?: string | null;
};

interface Props {
  readonly selectedSensorId?: string;
  readonly assignedSensorIds: string[];
  readonly onSelectSensor: (sensor: AvailableSensor) => void;
}

export default function AvailableSensors({
  selectedSensorId,
  assignedSensorIds,
  onSelectSensor,
}: Props) {
  const [sensors, setSensors] = useState<AvailableSensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSensors = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const token = await user.getIdToken();
      const response = await fetch("/api/sensors", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch sensors");
      }
      if (!Array.isArray(result.data)) {
        throw new Error("Invalid sensor list response");
      }
      setSensors(result.data.filter((sensor: AvailableSensor) => !sensor.spotId));
    } catch (error) {
      console.error("Failed to fetch available sensors:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch sensors");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSensors();
    const interval = window.setInterval(() => void fetchSensors(false), 5000);
    return () => window.clearInterval(interval);
  }, []);

  const availableSensors = sensors.filter(
    (sensor) => !assignedSensorIds.includes(sensor.sensorId)
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 dark:text-slate-100">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold dark:text-slate-100">Available Sensors</h3>
        <button
          type="button"
          onClick={() => void fetchSensors()}
          disabled={loading}
          className="rounded border px-2 py-1 text-xs hover:bg-gray-100 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}

      <div className="max-h-43 min-h-0 overflow-y-auto rounded border bg-white dark:border-slate-700 dark:bg-slate-800">
        {loading && (
          <div aria-busy="true" aria-live="polite">
            <span className="sr-only">Loading sensors…</span>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="border-b p-3">
                <Skeleton className="mb-1 h-4 w-28" />
                <Skeleton className="h-3 w-40" />
              </div>
            ))}
          </div>
        )}

        {!loading && !error && availableSensors.length === 0 && (
          <div className="p-4 text-center text-sm text-gray-500 dark:text-slate-400">
            No unassigned sensors available.
          </div>
        )}

        {!loading &&
          availableSensors.map((sensor) => (
            <button
              key={sensor.sensorId}
              type="button"
              onClick={() => onSelectSensor(sensor)}
              aria-pressed={selectedSensorId === sensor.sensorId}
              className={`w-full border-b p-3 text-left transition-colors hover:bg-blue-50 dark:border-slate-700 dark:hover:bg-slate-700 ${
                selectedSensorId === sensor.sensorId
                  ? "bg-blue-100 dark:bg-blue-950"
                  : ""
              }`}
            >
              <div className="text-sm font-semibold">{sensor.deviceId || sensor.sensorId}</div>
              <div className="mt-1 text-xs text-gray-600 dark:text-slate-400">
                Sensor ID: {sensor.sensorId}
                {sensor.status ? ` · ${sensor.status}` : ""}
              </div>
            </button>
          ))}
      </div>
    </div>
  );
}
