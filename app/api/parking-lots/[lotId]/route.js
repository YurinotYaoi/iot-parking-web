import { withAuth } from '@/utils/withAuth';
import { getParkingLotById, updateParkingLot, deleteParkingLot } from '@/services/parkingLotService';
import { successResponse, errorResponse } from '@/utils/response';

// GET /api/parking-lots/[lotId] — any authenticated user
export const GET = withAuth(async (req, { params }) => {
  try {
    const { lotId } = await params;
    const lot = await getParkingLotById(lotId);
    if (!lot) return errorResponse('Parking lot not found', 404);
    return successResponse({ lotId, ...lot });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
});

// PATCH /api/parking-lots/[lotId] — admin only, must own the lot
export const PATCH = withAuth(async (req, { params }) => {
  try {
    const { lotId } = await params;
    const lot = await getParkingLotById(lotId);
    if (!lot) return errorResponse('Parking lot not found', 404);
    if (lot.adminUid !== req.user.uid) {
      return errorResponse('Forbidden — you do not own this lot', 403);
    }
    const body = await req.json();
    const updated = await updateParkingLot(lotId, body);
    return successResponse(updated);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}, 'admin');

// DELETE /api/parking-lots/[lotId] — admin only, must own the lot
export const DELETE = withAuth(async (req, { params }) => {
  try {
    const { lotId } = await params;
    const lot = await getParkingLotById(lotId);
    if (!lot) return errorResponse('Parking lot not found', 404);
    if (lot.adminUid !== req.user.uid) {
      return errorResponse('Forbidden — you do not own this lot', 403);
    }
    const result = await deleteParkingLot(lotId);
    return successResponse(result);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}, 'admin');