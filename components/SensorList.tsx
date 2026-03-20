import { DEFAULT_SENSORS, Sensor } from "@/models/sensor.model";

export default function SensorList() {
  const sensors: Sensor[] = DEFAULT_SENSORS

  return (
    <div>
      <h1>Sensors</h1>

      {sensors.map((sensor: Sensor) => (
        <div key={sensor.id}>
          <h3>{sensor.name}</h3>
          <p>{sensor.floor}</p>
          <p>{sensor.row}</p>
          <p>{sensor.column}</p>
          <p>{sensor.status}</p>
        </div>
      ))}
    </div>
  );
}