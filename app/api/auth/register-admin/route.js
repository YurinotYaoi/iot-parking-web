import { registerUser } from '@/services/authService';
import { db } from '@/lib/firebaseAdmin'; // ✅ use admin SDK (IMPORTANT)
import { successResponse, errorResponse } from '@/utils/response';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      email,
      password,
      firstName,
      middleName,
      lastName,
      secretKey
    } = body;

    // ✅ Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return errorResponse("Missing required fields", 400);
    }

    // ✅ Validate admin secret key
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return errorResponse("Invalid secret key", 403);
    }

    // ✅ Create user with admin role
    const user = await registerUser({
      email,
      password,
      firstName,
      middleName,
      lastName,
      role: "admin", // 🔥 assign role here
    });

    // ✅ Save/update role in Firestore (single source of truth)
    await db.collection("users").doc(user.uid).set(
      {
        uid: user.uid,
        email,
        firstName,
        middleName,
        lastName,
        role: "admin",
        createdAt: new Date(),
      },
      { merge: true } // prevents overwrite
    );

    return successResponse(
      {
        uid: user.uid,
        email,
        role: "admin",
      },
      201
    );

  } catch (err: any) {
    console.error("REGISTER ADMIN ERROR:", err);

    if (err.code === "auth/email-already-exists") {
      return errorResponse("Email already exists", 409);
    }

    return errorResponse(err.message || "Internal server error", 500);
  }
}