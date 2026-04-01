// ============================================================
// ROUTE: /api/sensors/[sensorId]/ping
// POST — ESP32 reports occupancy (no Bearer token, uses deviceId)
// Called by hardware, not by the frontend
// ============================================================

import { handleSensorPing, getSensorById } from '@/services/sensorService';
import { successResponse, errorResponse } from '@/utils/response';

export async function POST(req, { params }) {
  try {
    const { sensorId } = await params;
    const body = await req.json();
    const { isOccupied, deviceId } = body;

    if (isOccupied === undefined || !deviceId) {
      return errorResponse('Missing required fields: isOccupied, deviceId', 400);
    }

    // Verify deviceId matches the registered sensor (no token auth for ESP32)
    const sensor = await getSensorById(sensorId);
    if (!sensor) return errorResponse('Sensor not found', 404);
    if (sensor.deviceId !== deviceId) {
      return errorResponse('Device ID mismatch', 403);
    }

    const result = await handleSensorPing(sensorId, { isOccupied });
    return successResponse(result);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}