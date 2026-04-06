import admin from 'firebase-admin';
import { db } from '@/lib/firebase';


export const registerUser = async (data) => {
  const { email, password, firstName, middleName, lastName, role } = data;

  const userRecord = await adminAuth.createUser({
    email,
    password,
    displayName,
  });

  await db.collection("users").doc(userRecord.uid).set({
    uid: userRecord.uid,
    email,
    firstName,
    middleName,
    lastName,
    role: role || "user", // fallback
    createdAt: new Date(),
  });

  return userRecord;
};

export async function getUserByUid(uid) {
  const snapshot = await db.ref(`users/${uid}`).once('value');
  return snapshot.val();
}

export async function verifyToken(token) {
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    console.log("Decoded token:", decoded);
    return decoded;
  } catch (err) {
    console.error("Token verification failed:", err.message);
    throw err;
  }
}