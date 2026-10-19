import { db } from '@/lib/configs/firebase';
import { v4 as uuidv4 } from 'uuid';
import { withAuth } from '@/utils/withAuth';
import { NextResponse } from 'next/server';

const prepareGridAndSpotUpdates = async (layoutId, grid, { lotId, ownerId }) => {
  const currentSpotsSnapshot = await db.ref('spots')
    .orderByChild('layoutId')
    .equalTo(layoutId)
    .once('value');
  const currentSpots = currentSpotsSnapshot.val() || {};
  const spotsToClear = Object.keys(currentSpots);
  const spotsInGrid = new Set();
  const pendingSensors = new Set();
  const spotUpdates = {};
  const normalizedGrid = Array.isArray(grid)
    ? grid.map((row) =>
        Array.isArray(row)
          ? row.map((cell) => {
              if (cell?.type === 'slot' && cell.spotId && cell.spotData) return { ...cell };
              if (cell?.type === 'road') return { type: 'road' };
              return { type: 'empty' };
            })
          : []
      )
    : [];

  for (let row = 0; row < normalizedGrid.length; row++) {
    for (let col = 0; col < normalizedGrid[row].length; col++) {
      const cell = normalizedGrid[row][col];
      if (!cell || cell.type !== 'slot' || !cell.spotId || !cell.spotData) continue;

      const rowNo = String(row + 1);
      const columnNo = String(col + 1);
      let spotId = cell.spotId;
      const spotData = cell.spotData;

      if (spotData.isDraft) {
        spotId = uuidv4();
        const now = Date.now();
        const status = ['available', 'occupied', 'reserved'].includes(spotData.status)
          ? spotData.status
          : 'available';
        spotUpdates[`spots/${spotId}`] = {
          lotId,
          layoutId,
          slotName: spotData.slotName || `Slot ${row + 1}-${col + 1}`,
          rowNo,
          columnNo,
          floor: spotData.floor || '1',
          vehicleType: spotData.vehicleType || 'any',
          status,
          forcedOccupied: false,
          ownerId,
          createdAt: now,
          updatedAt: now,
        };

        if (spotData.pendingSensorId) {
          if (pendingSensors.has(spotData.pendingSensorId)) {
            throw new Error(`Sensor ${spotData.pendingSensorId} is assigned to more than one draft slot`);
          }
          pendingSensors.add(spotData.pendingSensorId);
          const sensorRef = db.ref(`sensors/${spotData.pendingSensorId}`);
          const sensorSnapshot = await sensorRef.once('value');
          const sensor = sensorSnapshot.val();
          if (!sensor) {
            throw new Error(`Sensor ${spotData.pendingSensorId} not found`);
          }
          if (sensor.spotId) {
            throw new Error(`Sensor ${spotData.pendingSensorId} is already assigned`);
          }
          spotUpdates[`sensors/${spotData.pendingSensorId}/spotId`] = spotId;
          spotUpdates[`sensors/${spotData.pendingSensorId}/assigned`] = true;
        }

        const persistedSpotData = { ...spotData };
        delete persistedSpotData.isDraft;
        delete persistedSpotData.pendingSensorId;
        normalizedGrid[row][col] = {
          ...cell,
          spotId,
          spotData: {
            ...persistedSpotData,
            slotId: spotId,
            rowNo,
            columnNo,
            layoutId,
            lotId,
            forcedOccupied: false,
          },
        };
      } else {
        spotUpdates[`spots/${spotId}/layoutId`] = layoutId;
        spotUpdates[`spots/${spotId}/rowNo`] = rowNo;
        spotUpdates[`spots/${spotId}/columnNo`] = columnNo;
        spotUpdates[`spots/${spotId}/updatedAt`] = Date.now();
        normalizedGrid[row][col] = {
          ...cell,
          spotData: { ...spotData, rowNo, columnNo, layoutId, lotId },
        };
      }

      spotsInGrid.add(spotId);
    }
  }

  for (const spotId of spotsToClear) {
    if (spotsInGrid.has(spotId)) continue;
    spotUpdates[`spots/${spotId}/layoutId`] = null;
    spotUpdates[`spots/${spotId}/rowNo`] = null;
    spotUpdates[`spots/${spotId}/columnNo`] = null;
    spotUpdates[`spots/${spotId}/updatedAt`] = Date.now();
  }

  return { grid: normalizedGrid, spotUpdates };
};

const getLayoutsHandler = withAuth(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const lotId = searchParams.get('lotId');
    const layoutId = searchParams.get('layoutId');

    if (layoutId) {
      const snapshot = await db.ref(`layouts/${layoutId}`).once('value');
      const layout = snapshot.val();
      if (!layout) {
        return NextResponse.json({ error: 'Layout not found' }, { status: 404 });
      }
      // Check ownership: user must be the owner
      if (layout.ownerId !== req.user.uid) {
        return NextResponse.json({ error: 'Forbidden — you do not own this layout' }, { status: 403 });
      }
      return NextResponse.json({ data: { layoutId, ...layout } });
    }

    if (lotId) {
      const snapshot = await db
        .ref('layouts')
        .orderByChild('lotId')
        .equalTo(lotId)
        .once('value');
      const data = snapshot.val();
      if (!data) {
        return NextResponse.json({ data: [] });
      }
      const layouts = Object.entries(data)
        .filter(([, layout]) => layout.ownerId === req.user.uid)
        .map(([id, layout]) => ({
          layoutId: id,
          ...layout,
        }));
      return NextResponse.json({ data: layouts });
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error) {
    console.error('Error in GET /api/layouts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

const createLayoutHandler = withAuth(async (req) => {
  try {
    const body = await req.json();
    const { lotId, layoutName, notes, rows, cols, grid, floor } = body;

    if (!lotId) {
      return NextResponse.json({ error: 'lotId is required' }, { status: 400 });
    }

    const layoutId = uuidv4();
    const { grid: savedGrid, spotUpdates } = await prepareGridAndSpotUpdates(layoutId, grid, {
      lotId,
      ownerId: req.user.uid,
    });
    const layout = {
      lotId,
      layoutName: layoutName || 'Untitled Layout',
      notes: notes || '',
      floor: floor || '1',
      totalRows: rows || 0,
      totalColumns: cols || 0,
      grid: savedGrid,
      ownerId: req.user.uid,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.ref().update({
      [`layouts/${layoutId}`]: layout,
      ...spotUpdates,
    });

    return NextResponse.json({ data: { layoutId, ...layout } }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/layouts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

const updateLayoutHandler = withAuth(async (req) => {
  try {
    const body = await req.json();
    const { layoutId, layoutName, notes, totalRows, totalColumns, grid, isActive } = body;

    if (!layoutId) {
      return NextResponse.json({ error: 'layoutId is required' }, { status: 400 });
    }

    const layoutSnapshot = await db.ref(`layouts/${layoutId}`).once('value');
    const existingLayout = layoutSnapshot.val();
    if (!existingLayout) {
      return NextResponse.json({ error: 'Layout not found' }, { status: 404 });
    }
    if (existingLayout.ownerId !== req.user.uid) {
      return NextResponse.json({ error: 'Forbidden — you do not own this layout' }, { status: 403 });
    }

    const sanitized = {};

    if (layoutName !== undefined) sanitized.layoutName = layoutName;
    if (notes !== undefined) sanitized.notes = notes;
    if (totalRows !== undefined) sanitized.totalRows = totalRows;
    if (totalColumns !== undefined) sanitized.totalColumns = totalColumns;
    const spotUpdates = {};
    if (grid !== undefined) {
      const prepared = await prepareGridAndSpotUpdates(layoutId, grid, {
        lotId: existingLayout.lotId,
        ownerId: req.user.uid,
      });
      sanitized.grid = prepared.grid;
      Object.assign(spotUpdates, prepared.spotUpdates);
    }
    if (isActive !== undefined) sanitized.isActive = isActive;

    sanitized.updatedAt = Date.now();

    await db.ref().update({
      [`layouts/${layoutId}`]: { ...existingLayout, ...sanitized },
      ...spotUpdates,
    });

    return NextResponse.json({ data: { layoutId, ...sanitized } });
  } catch (error) {
    console.error('Error in PATCH /api/layouts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

const deleteLayoutHandler = withAuth(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const layoutId = searchParams.get('layoutId');

    if (!layoutId) {
      return NextResponse.json({ error: 'layoutId is required' }, { status: 400 });
    }

    await db.ref(`layouts/${layoutId}`).remove();

    // Clear layout information from all spots that were in this layout
    const spotsSnapshot = await db.ref('spots')
      .orderByChild('layoutId')
      .equalTo(layoutId)
      .once('value');
    const spots = spotsSnapshot.val() || {};

    const updatePromises = Object.keys(spots).map(spotId =>
      db.ref(`spots/${spotId}`).update({
        layoutId: null,
        rowNo: null,
        columnNo: null,
        updatedAt: Date.now(),
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ data: { layoutId, deleted: true } });
  } catch (error) {
    console.error('Error in DELETE /api/layouts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

export const GET = getLayoutsHandler;
export const POST = createLayoutHandler;
export const PATCH = updateLayoutHandler;
export const DELETE = deleteLayoutHandler;
