import { DEFAULT_SENSORS, Sensor } from "@/models/sensor.model";
import { Button } from "./ui/button";

export default function SensorList() {
  const sensors: Sensor[] = DEFAULT_SENSORS

  return (
    <div>
        <div className="grid grid-cols-6 border-b">
          <div className="p-3">Sensor Name</div>
          <div className="p-3 text-center">Floor</div>
          <div className="p-3 text-center">Column</div>
          <div className="p-3 text-center">Row</div>
          <div className="p-3">Status</div>
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

          <div className="p-3 flex justify-center"><Button className="w-full">Edit</Button></div>
        </div>
      ))}
    </div>
  );
}