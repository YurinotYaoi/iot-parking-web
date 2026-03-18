import { verifyToken } from '@/services/authService';
import { getUserByUid } from '@/services/authService';
import { successResponse, errorResponse } from '@/utils/response';

export async function POST(req) {
  try {
    const { token } = await req.json();
    if (!token) return errorResponse('No token provided');

    const decoded = await verifyToken(token);
    const userProfile = await getUserByUid(decoded.uid);

    return successResponse({ uid: decoded.uid, ...userProfile });
  } catch (err) {
    return errorResponse('Invalid or expired token', 401);
  }
}