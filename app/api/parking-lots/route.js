import { withAuth } from '@/utils/withAuth';
import { getAllParkingLots, createParkingLot } from '@/services/parkingLotService';
import { validateRequiredFields } from '@/utils/validate';
import { successResponse, errorResponse } from '@/utils/response';

// GET /api/parking-lots — any authenticated user
export const GET = withAuth(async (req) => {
  try {
    const lots = await getAllParkingLots();
    return successResponse(lots);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
});

// POST /api/parking-lots — admin only
export const POST = withAuth(async (req) => {
  try {
    const body = await req.json();
    const missing = validateRequiredFields(body, ['locationName', 'totalSpace']);
    if (missing) return errorResponse(missing, 400);

    const lot = await createParkingLot(req.user.uid, body);
    return successResponse(lot, 201);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}, 'admin');