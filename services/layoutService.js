import { db } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

export async function getLayoutsByLot(lotId) {
  const snapshot = await db.ref('layouts')
    .orderByChild('lotId')
    .equalTo(lotId)
    .once('value');
  const data = snapshot.val();
  if (!data) return [];
  return Object.entries(data).map(([layoutId, layout]) => ({ layoutId, ...layout }));
}

export async function getLayoutById(layoutId) {
  const snapshot = await db.ref(`layouts/${layoutId}`).once('value');
  return snapshot.val();
}

export async function createLayout(lotId, data) {
  const layoutId = uuidv4();
  const layout = {
    lotId,
    layoutName: data.layoutName,
    floor: data.floor || '1',
    totalRows: data.totalRows || 0,
    totalColumns: data.totalColumns || 0,
    isActive: true,
    createdAt: Date.now(),
  };
  await db.ref(`layouts/${layoutId}`).set(layout);
  return { layoutId, ...layout };
}

export async function updateLayout(layoutId, updates) {
  const allowed = ['layoutName', 'floor', 'totalRows', 'totalColumns', 'isActive'];
  const sanitized = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) sanitized[key] = updates[key];
  }
  await db.ref(`layouts/${layoutId}`).update(sanitized);
  return { layoutId, ...sanitized };
}

export async function deleteLayout(layoutId) {
  await db.ref(`layouts/${layoutId}`).remove();
  return { layoutId, deleted: true };
}