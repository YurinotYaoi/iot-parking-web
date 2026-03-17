import admin from 'firebase-admin';
import { db } from '@/lib/firebase';


export async function registerUser({ email, password, firstName, middleName, lastName }) {
  const displayName = [firstName, middleName, lastName].filter(Boolean).join(' ');
  const userRecord = await admin.auth().createUser({
    email,
    password,
    displayName,
  });

  // Store extra profile info in Realtime DB
  await db.ref(`users/${userRecord.uid}`).set({
    firstName,
    middleName,
    lastName,
    email,
    role: 'user',
    createdAt: Date.now(),
  });

  return userRecord;
}

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