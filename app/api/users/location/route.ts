// ============================================================
// ROUTE: /api/users/location
// PATCH — update user's location
// ============================================================

import { withAuth } from '@/utils/withAuth';
import { updateUserLocation } from '@/services/userService';
import { successResponse, errorResponse } from '@/utils/response';

export const PATCH = withAuth(async (req) => {
  try {
    const { name, link } = await req.json();
    const updatedUser = await updateUserLocation(req.user.uid, { name, link });
    return successResponse(updatedUser);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
});