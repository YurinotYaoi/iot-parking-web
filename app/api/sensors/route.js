// ============================================================
// ROUTE: /api/sensors
// GET  — list all sensors   (admin only)
// POST — create a sensor    (admin only)
// ============================================================

import { withAuth } from '@/utils/withAuth';
import { getAllSensors, createSensor } from '@/services/sensorService';
import { getSpotById } from '@/services/spotService';
import { validateRequiredFields } from '@/utils/validate';
import { successResponse, errorResponse } from '@/utils/response';

export const GET = withAuth(async (req) => {
  try {
    const sensors = await getAllSensors();
    return successResponse(sensors);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}, 'admin');

export const POST = withAuth(async (req) => {
  try {
    const body = await req.json();
    const missing = validateRequiredFields(body, ['spotId', 'deviceId']);
    if (missing) return errorResponse(missing, 400);

    // Verify the target spot exists
    const spot = await getSpotById(body.spotId);
    if (!spot) return errorResponse('Spot not found', 404);

    const sensor = await createSensor(body.spotId, body);
    return successResponse(sensor, 201);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}, 'admin');