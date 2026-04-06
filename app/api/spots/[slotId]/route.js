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

    const lot = spot.lotId ? await getParkingLotById(spot.lotId) : null;
    const isOwner = spot.ownerId === req.user.uid;
    const isAdmin = lot?.adminUid === req.user.uid;

    if (!isOwner && !isAdmin) {
      return errorResponse('Forbidden — you do not own this spot or lot', 403);
    }

    const body = await req.json();
    const updated = await updateSpot(slotId, body);
    return successResponse(updated);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
});

export const DELETE = withAuth(async (req, { params }) => {
  try {
    const { slotId } = await params;
    const spot = await getSpotById(slotId);
    if (!spot) return errorResponse('Spot not found', 404);

    const lot = spot.lotId ? await getParkingLotById(spot.lotId) : null;
    const isOwner = spot.ownerId === req.user.uid;
    const isAdmin = lot?.adminUid === req.user.uid;

    if (!isOwner && !isAdmin) {
      return errorResponse('Forbidden — you do not own this spot or lot', 403);
    }

    const result = await deleteSpot(slotId);
    return successResponse(result);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
});