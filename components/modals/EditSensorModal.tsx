"use client"

import { Sensor } from "@/models/sensor.model"

type Props = {
  sensor: Sensor | null
  onClose: () => void
}

export default function EditSensorModal({ sensor, onClose }: Props) {

  if (!sensor) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center"
    onClick={onClose}>

      <div className="bg-white/75 p-6 rounded w-[400px]"
      onClick={(e) => e.stopPropagation()}>

        <h2 className="text-xl font-bold mb-4">
          Edit {sensor.name}
        </h2>

        <p>Floor: {sensor.floor}</p>
        <p>Row: {sensor.row}</p>
        <p>Column: {sensor.column}</p>
        <p>Status: {sensor.status}</p>

        <button
          className="mt-4 bg-red-500 text-white px-3 py-1"
          onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}