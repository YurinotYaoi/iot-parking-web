import { registerUser } from '@/services/authService';
import { validateRequiredFields, isValidEmail, isValidPassword } from '@/utils/validate';
import { successResponse, errorResponse } from '@/utils/response';

export async function POST(req) {
  try {
    const body = await req.json();

    //Error handling for missing fields and invalid formats
    const missing = validateRequiredFields(body, ['email', 'password', 'firstName', 'middleName', 'lastName']);
    if (missing) return errorResponse(missing, 400);
    //Error handling for invalid email and password formats
    if (!isValidEmail(body.email)) return errorResponse('Invalid email format', 400);
    if (!isValidPassword(body.password)) return errorResponse('Password must be at least 6 characters', 400);

    // authService will process registration and throw if email already exists
    const user = await registerUser(body);
    return successResponse({ uid: user.uid, email: user.email }, 201);
  } catch (err) {
    if (err.code === 'auth/email-already-exists') {
      return errorResponse('Email is already registered', 409);
    }
    return errorResponse(err.message, 500);
  }
}
