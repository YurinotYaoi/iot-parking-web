import { withAuth } from '@/utils/withAuth';
import { getLayoutsByLot, createLayout } from '@/services/layoutService';
import { getParkingLotById } from '@/services/parkingLotService';
import { validateRequiredFields } from '@/utils/validate';
import { successResponse, errorResponse } from '@/utils/response';

// GET /api/parking-lots/[lotId]/layouts — any authenticated user
export const GET = withAuth(async (req, { params }) => {
  try {
    const { lotId } = await params;
    const layouts = await getLayoutsByLot(lotId);
    return successResponse(layouts);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
});

// POST /api/parking-lots/[lotId]/layouts — admin only, must own the lot
export const POST = withAuth(async (req, { params }) => {
  try {
    const { lotId } = await params;
    const lot = await getParkingLotById(lotId);
    if (!lot) return errorResponse('Parking lot not found', 404);
    if (lot.adminUid !== req.user.uid) {
      return errorResponse('Forbidden — you do not own this lot', 403);
    }
    const body = await req.json();
    const missing = validateRequiredFields(body, ['layoutName']);
    if (missing) return errorResponse(missing, 400);

    const layout = await createLayout(lotId, body);
    return successResponse(layout, 201);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}, 'admin');