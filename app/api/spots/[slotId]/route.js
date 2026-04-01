// ============================================================
// ROUTE: /api/spots/[slotId]
// GET    — get one spot      (any auth)
// PATCH  — update spot       (admin, owner only)
// DELETE — delete spot       (admin, owner only)
// ============================================================

import { withAuth } from '@/utils/withAuth';
import { getSpotById, updateSpot, deleteSpot } from '@/services/spotService';
import { getParkingLotById } from '@/services/parkingLotService';
import { successResponse, errorResponse } from '@/utils/response';

export const GET = withAuth(async (req, { params }) => {
  try {
    const { slotId } = await params;
    const spot = await getSpotById(slotId);
    if (!spot) return errorResponse('Spot not found', 404);
    return successResponse({ slotId, ...spot });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
});

export const PATCH = withAuth(async (req, { params }) => {
  try {
    const { slotId } = await params;
    const spot = await getSpotById(slotId);
    if (!spot) return errorResponse('Spot not found', 404);

    const lot = await getParkingLotById(spot.lotId);
    if (lot.adminUid !== req.user.uid) {
      return errorResponse('Forbidden — you do not own this lot', 403);
    }
    const body = await req.json();
    const updated = await updateSpot(slotId, body);
    return successResponse(updated);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}, 'admin');

export const DELETE = withAuth(async (req, { params }) => {
  try {
    const { slotId } = await params;
    const spot = await getSpotById(slotId);
    if (!spot) return errorResponse('Spot not found', 404);

    const lot = await getParkingLotById(spot.lotId);
    if (lot.adminUid !== req.user.uid) {
      return errorResponse('Forbidden — you do not own this lot', 403);
    }
    const result = await deleteSpot(slotId);
    return successResponse(result);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}, 'admin');