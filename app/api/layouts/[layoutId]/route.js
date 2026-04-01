// ============================================================
// ROUTE: /api/layouts/[layoutId]
// GET    — get one layout      (any auth)
// PATCH  — update layout       (admin, owner only)
// DELETE — delete layout       (admin, owner only)
// ============================================================

import { withAuth } from '@/utils/withAuth';
import { getLayoutById, updateLayout, deleteLayout } from '@/services/layoutService';
import { getParkingLotById } from '@/services/parkingLotService';
import { successResponse, errorResponse } from '@/utils/response';

export const GET = withAuth(async (req, { params }) => {
  try {
    const { layoutId } = await params;
    const layout = await getLayoutById(layoutId);
    if (!layout) return errorResponse('Layout not found', 404);
    return successResponse({ layoutId, ...layout });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
});

export const PATCH = withAuth(async (req, { params }) => {
  try {
    const { layoutId } = await params;
    const layout = await getLayoutById(layoutId);
    if (!layout) return errorResponse('Layout not found', 404);

    const lot = await getParkingLotById(layout.lotId);
    if (lot.adminUid !== req.user.uid) {
      return errorResponse('Forbidden — you do not own this lot', 403);
    }
    const body = await req.json();
    const updated = await updateLayout(layoutId, body);
    return successResponse(updated);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}, 'admin');

export const DELETE = withAuth(async (req, { params }) => {
  try {
    const { layoutId } = await params;
    const layout = await getLayoutById(layoutId);
    if (!layout) return errorResponse('Layout not found', 404);

    const lot = await getParkingLotById(layout.lotId);
    if (lot.adminUid !== req.user.uid) {
      return errorResponse('Forbidden — you do not own this lot', 403);
    }
    const result = await deleteLayout(layoutId);
    return successResponse(result);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}, 'admin');