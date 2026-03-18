// utils/withAuth.js
// Higher-order function to wrap API route handlers with authentication and optional role-based access control
// Usage: export default withAuth(handler
//        or export default withAuth(handler, 'admin') for admin-only access
// This abstracts token verification and user retrieval, allowing handlers to focus on business logic
// Example usage in an API route:
// import { withAuth } from '@/utils/withAuth';
// async function handler(req) { /* ... */ }
// export default withAuth(handler, 'admin'); // Only allow admin users
import { verifyToken, getUserByUid } from '@/services/authService';
import { errorResponse } from '@/utils/response';


export function withAuth(handler, requiredRole = null) {
  return async function (req, ...args) {
    try {
      const authHeader = req.headers.get('authorization');
      const token = authHeader?.split('Bearer ')[1];
      if (!token) return errorResponse('Unauthorized', 401);

      const decoded = await verifyToken(token);
      const profile = await getUserByUid(decoded.uid);

      if (!profile) return errorResponse('User not found', 404);

      // Role check — if requiredRole is set, enforce it
      if (requiredRole && profile.role !== requiredRole) {
        return errorResponse('Forbidden — insufficient role', 403);
      }

      // Attach user to request for use in handler
      req.user = { uid: decoded.uid, ...profile };
      return handler(req, ...args);
    } catch {
      return errorResponse('Invalid or expired token', 401);
    }
  };
}