// services/slotService.js
import { db } from '@/lib/firebase';

export async function getAllSlots() {
  const snapshot = await db.ref('slots').once('value');
  return snapshot.val();
}

export async function updateSlotStatus(slotId, status) {
  await db.ref(`slots/${slotId}`).update({ status, updatedAt: Date.now() });
  return { slotId, status };
}