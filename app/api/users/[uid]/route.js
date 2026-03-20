import { withAuth } from '@/utils/withAuth';
import { getUserByUid, updateUser, deleteUser } from '@/services/userService';
import { successResponse, errorResponse } from '@/utils/response';

// GET /api/users/[uid] — admin or the user themselves
export const GET = withAuth(async (req, { params }) => {
  try {
    const { uid } = await params;
    // Allow access only if admin or requesting own profile
    if (req.user.role !== 'admin' && req.user.uid !== uid) {
      return errorResponse('Forbidden', 403);
    }
    const user = await getUserByUid(uid);
    if (!user) return errorResponse('User not found', 404);
    return successResponse({ uid, ...user });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
});

// PATCH /api/users/[uid] — admin or the user themselves
export const PATCH = withAuth(async (req, { params }) => {
  try {
    const { uid } = await params;
    if (req.user.role !== 'admin' && req.user.uid !== uid) {
      return errorResponse('Forbidden', 403);
    }
    const body = await req.json();
    // Only admin can change isActive
    if (body.isActive !== undefined && req.user.role !== 'admin') {
      return errorResponse('Only admins can change active status', 403);
    }
    const updated = await updateUser(uid, body);
    return successResponse(updated);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
});

// DELETE /api/users/[uid] — admin only
export const DELETE = withAuth(async (req, { params }) => {
  try {
    const { uid } = await params;
    const result = await deleteUser(uid);
    return successResponse(result);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}, 'admin');