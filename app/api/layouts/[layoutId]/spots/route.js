// ============================================================
// ROUTE: /api/layouts/[layoutId]/spots
// GET  — list all spots in this layout   (any auth)
// POST — create a spot in this layout    (admin, owner only)
// ============================================================

import { withAuth } from '@/utils/withAuth';
import { getSpotsByLayout, createSpot } from '@/services/spotService';
import { getLayoutById } from '@/services/layoutService';
import { getParkingLotById } from '@/services/parkingLotService';
import { validateRequiredFields } from '@/utils/validate';
import { successResponse, errorResponse } from '@/utils/response';

export const GET = withAuth(async (req, { params }) => {
  try {
    const { layoutId } = await params;
    const spots = await getSpotsByLayout(layoutId);
    return successResponse(spots);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
});

export const POST = withAuth(async (req, { params }) => {
  try {
    const { layoutId } = await params;
    const layout = await getLayoutById(layoutId);
    if (!layout) return errorResponse('Layout not found', 404);

    const lot = await getParkingLotById(layout.lotId);
    if (lot.adminUid !== req.user.uid) {
      return errorResponse('Forbidden — you do not own this lot', 403);
    }
    const body = await req.json();
    const missing = validateRequiredFields(body, ['rowNo', 'columnNo']);
    if (missing) return errorResponse(missing, 400);

    const spot = await createSpot(layout.lotId, layoutId, body);
    return successResponse(spot, 201);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}, 'admin');