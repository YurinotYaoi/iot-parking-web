import { withAuth } from '@/utils/withAuth';
import admin from 'firebase-admin';
import { successResponse, errorResponse } from '@/utils/response';

export const POST = withAuth(async (req) => {
  try {
    const { uid, newPassword } = await req.json();

    // Verify the user is changing their own password
    if (req.user.uid !== uid) {
      return errorResponse('Forbidden - can only change your own password', 403);
    }

    if (!newPassword || newPassword.length < 6) {
      return errorResponse('Password must be at least 6 characters', 400);
    }

    // Update password in Firebase Auth
    await admin.auth().updateUser(uid, { password: newPassword });

    return successResponse({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password change error:', err);
    if (err.code === 'auth/invalid-uid') {
      return errorResponse('Invalid user ID', 400);
    }
    return errorResponse(err.message || 'Failed to update password', 500);
  }
});
