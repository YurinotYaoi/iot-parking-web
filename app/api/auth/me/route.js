import { verifyToken, getUserByUid } from '@/services/authService';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split('Bearer ')[1];
    if (!token) return errorResponse('Unauthorized', 401);

    const decoded = await verifyToken(token);
    const profile = await getUserByUid(decoded.uid);
    return successResponse(profile);
  } catch {
    return errorResponse('Invalid token', 401);
  }
}