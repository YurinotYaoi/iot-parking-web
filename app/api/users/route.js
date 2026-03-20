import { withAuth } from '@/utils/withAuth';
import { getAllUsers } from '@/services/userService';
import { successResponse, errorResponse } from '@/utils/response';

// GET /api/users — admin only
export const GET = withAuth(async (req) => {
  try {
    const users = await getAllUsers();
    return successResponse(users);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}, 'admin');