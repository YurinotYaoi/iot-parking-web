import admin from 'firebase-admin';
import { db } from '@/lib/firebase';

export async function getAllUsers() {
  const snapshot = await db.ref('users').once('value');
  const data = snapshot.val();
  if (!data) return [];
  return Object.entries(data).map(([uid, user]) => ({ uid, ...user }));
}

export async function getUserByUid(uid) {
  const snapshot = await db.ref(`users/${uid}`).once('value');
  return snapshot.val();
}

export async function updateUser(uid, updates) {
  const allowed = ['firstName', 'middleName', 'lastName', 'phoneNumber', 'isActive'];
  const sanitized = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) sanitized[key] = updates[key];
  }
  sanitized.updatedAt = Date.now();
  await db.ref(`users/${uid}`).update(sanitized);

  // Also update Firebase Auth displayName if name fields changed
  if (updates.firstName || updates.lastName) {
    const snapshot = await db.ref(`users/${uid}`).once('value');
    const user = snapshot.val();
    const displayName = [user.firstName, user.middleName, user.lastName]
      .filter(Boolean).join(' ');
    await admin.auth().updateUser(uid, { displayName });
  }
  return { uid, ...sanitized };
}

export async function deleteUser(uid) {
  await admin.auth().deleteUser(uid);
  await db.ref(`users/${uid}`).remove();
  return { uid, deleted: true };
}

export async function setUserActiveStatus(uid, isActive) {
  await db.ref(`users/${uid}`).update({ isActive, updatedAt: Date.now() });
  await admin.auth().updateUser(uid, { disabled: !isActive });
  return { uid, isActive };
}