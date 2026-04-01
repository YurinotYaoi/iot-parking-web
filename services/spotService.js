// ============================================================
// SERVICE: spotService.js
// Handles all Spot CRUD against Firebase Realtime DB
// Used by: /api/layouts/[layoutId]/spots
//          /api/spots/[slotId]
// ============================================================

import { db } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

const VALID_STATUSES = ['available', 'occupied', 'reserved', 'disabled'];
const VALID_VEHICLE_TYPES = ['sedan', 'motorcycle', 'van', 'truck', 'any'];

export async function getAllSpots() {
  const snapshot = await db.ref('spots').once('value');
  const data = snapshot.val();
  if (!data) return [];
  return Object.entries(data).map(([slotId, spot]) => ({ slotId, ...spot }));
}

export async function getSpotsByLayout(layoutId) {
  const snapshot = await db.ref('spots')
    .orderByChild('layoutId')
    .equalTo(layoutId)
    .once('value');
  const data = snapshot.val();
  if (!data) return [];
  return Object.entries(data).map(([slotId, spot]) => ({ slotId, ...spot }));
}

export async function getSpotsByLot(lotId) {
  const snapshot = await db.ref('spots')
    .orderByChild('lotId')
    .equalTo(lotId)
    .once('value');
  const data = snapshot.val();
  if (!data) return [];
  return Object.entries(data).map(([slotId, spot]) => ({ slotId, ...spot }));
}

export async function getSpotById(slotId) {
  const snapshot = await db.ref(`spots/${slotId}`).once('value');
  return snapshot.val();
}

export async function createSpot(lotId, layoutId, data) {
  const slotId = uuidv4();
  const spot = {
    lotId,
    layoutId,
    label: data.label,
    rowNo: data.rowNo,
    columnNo: data.columnNo,
    vehicleType: VALID_VEHICLE_TYPES.includes(data.vehicleType) ? data.vehicleType : 'any',
    status: 'available',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await db.ref(`spots/${slotId}`).set(spot);
  return { slotId, ...spot };
}

export async function updateSpot(slotId, updates) {
  const allowed = ['label', 'rowNo', 'columnNo', 'vehicleType', 'status'];
  const sanitized = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) sanitized[key] = updates[key];
  }
  if (sanitized.status && !VALID_STATUSES.includes(sanitized.status)) {
    throw new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  if (sanitized.vehicleType && !VALID_VEHICLE_TYPES.includes(sanitized.vehicleType)) {
    throw new Error(`Invalid vehicleType. Must be one of: ${VALID_VEHICLE_TYPES.join(', ')}`);
  }
  sanitized.updatedAt = Date.now();
  await db.ref(`spots/${slotId}`).update(sanitized);
  return { slotId, ...sanitized };
}

export async function deleteSpot(slotId) {
  await db.ref(`spots/${slotId}`).remove();
  return { slotId, deleted: true };
}

// Called by sensor ping — only updates occupancy status
export async function updateSpotStatus(slotId, status) {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  const updatedAt = Date.now();
  await db.ref(`spots/${slotId}`).update({ status, updatedAt });
  return { slotId, status, updatedAt };
}