// ============================================================
// SERVICE: layoutServiceServer.js
// Server-side layout operations using Firebase Admin SDK
// Used by: /api/parking-lots/[lotId]/layouts
//          /api/layouts/[layoutId] (server routes)
// Do NOT import this in client components — use layoutService.js instead
// ============================================================

import { db } from '@/lib/firebase'; // Firebase Admin db

export async function getLayoutsByLot(lotId) {
  const snapshot = await db
    .ref('layouts')
    .orderByChild('lotId')
    .equalTo(lotId)
    .once('value');
  const data = snapshot.val();
  if (!data) return [];
  return Object.entries(data).map(([layoutId, layout]) => ({
    layoutId,
    ...layout,
  }));
}

export async function getLayoutById(layoutId) {
  const snapshot = await db.ref(`layouts/${layoutId}`).once('value');
  const data = snapshot.val();
  if (!data) return null;
  return { layoutId, ...data };
}

export async function createLayout(lotId, data, ownerId) {
  const { v4: uuidv4 } = await import('uuid');
  const layoutId = uuidv4();
  const layout = {
    lotId,
    layoutName: data.layoutName || 'Untitled Layout',
    notes: data.notes || '',
    floor: data.floor || '1',
    totalRows: data.rows || 0,
    totalColumns: data.cols || 0,
    grid: data.grid || [],
    ownerId,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await db.ref(`layouts/${layoutId}`).set(layout);
  return { layoutId, ...layout };
}

export async function updateLayout(layoutId, updates) {
  const allowed = ['layoutName', 'notes', 'totalRows', 'totalColumns', 'grid', 'isActive', 'floor'];
  const sanitized = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) sanitized[key] = updates[key];
  }
  sanitized.updatedAt = Date.now();
  await db.ref(`layouts/${layoutId}`).update(sanitized);
  return { layoutId, ...sanitized };
}

export async function deleteLayout(layoutId) {
  await db.ref(`layouts/${layoutId}`).remove();
  return { layoutId, deleted: true };
}