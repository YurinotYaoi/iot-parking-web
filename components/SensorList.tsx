"use client";

import { DEFAULT_SENSORS, Sensor } from "@/models/sensor.model";
import { Button } from "./ui/button";
import { useState } from "react"
import EditSensorModal from "@/components/modals/EditSensorModal"

export default function SensorList() {
  const sensors: Sensor[] = DEFAULT_SENSORS
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null)
  const handleShowESModal = () => {};

  return (
    <div className="h-[770]  overflow-y-auto rounded">
      <EditSensorModal sensor={selectedSensor} handleShowESModal={() => setSelectedSensor(null)} />
        <div className="grid grid-cols-6 border-b">
          <div className="p-3">Sensor Name</div>
          <div className="p-3 text-center">Floor</div>
          <div className="p-3 text-center">Column</div>
          <div className="p-3 text-center">Row</div>
          <div className="p-3 text-center">Status</div>
          <div className="p-3 text-center">Edit</div>
        </div>
      {sensors.map((sensor: Sensor) => (
        <div key={sensor.id} className="grid grid-cols-6 border-b">
          <h3 className="p-3">{sensor.name}</h3>
          <p className="p-3 text-center">{sensor.floor}</p>
          <p className="p-3 text-center">{sensor.row}</p>
          <p className="p-3 text-center">{sensor.column}</p>

          <div className="p-3">
            {sensor.status === "free"
              ? "🟢 Free"
              : "🔴 Occupied"}
          </div>

          <div className="p-3 flex justify-center"><Button className="w-full" onClick={() => {
            setSelectedSensor(sensor), 
            handleShowESModal
            }}>Edit</Button>
          </div>
        </div>
      ))}
    </div>
  );
}