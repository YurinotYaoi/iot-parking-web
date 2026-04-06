// ============================================================
// ROUTE: /api/sensors/[sensorId]
// GET    — get one sensor      (admin only)
// PATCH  — update sensor       (admin only)
// DELETE — delete sensor       (admin only)
// ============================================================

import { withAuth } from '@/utils/withAuth';
import { getSensorById, updateSensor, deleteSensor } from '@/services/sensorService';
import { successResponse, errorResponse } from '@/utils/response';

export const GET = withAuth(async (req, { params }) => {
  try {
    const { sensorId } = await params;
    const sensor = await getSensorById(sensorId);
    if (!sensor) return errorResponse('Sensor not found', 404);
    return successResponse({ sensorId, ...sensor });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}, 'admin');

export const PATCH = withAuth(async (req, { params }) => {
  try {
    const { sensorId } = await params;
    const sensor = await getSensorById(sensorId);
    if (!sensor) return errorResponse('Sensor not found', 404);

    const body = await req.json();
    const updates = {
      ...body,
    };

    if (body.spotId && !body.ownerId) {
      updates.ownerId = req.user.uid;
    }
    if (body.spotId) {
      updates.assigned = true;
    }

    const updated = await updateSensor(sensorId, updates);
    return successResponse(updated);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
});

export const DELETE = withAuth(async (req, { params }) => {
  try {
    const { sensorId } = await params;
    const sensor = await getSensorById(sensorId);
    if (!sensor) return errorResponse('Sensor not found', 404);
    const result = await deleteSensor(sensorId);
    return successResponse(result);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
});