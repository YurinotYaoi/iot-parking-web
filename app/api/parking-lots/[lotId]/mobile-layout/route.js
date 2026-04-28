// ============================================================
// ROUTE: /api/parking-lots/[lotId]/mobile-layout
// GET — returns all layouts with full grid data for the mobile app
//
// Response shape:
// {
//   success: true,
//   data: [
//     {
//       layoutId: string,
//       layoutName: string,
//       floor: string,
//       totalRows: number,
//       totalColumns: number,
//       grid: [          // rows × cols array of cells
//         [
//           { type: "empty" | "road" | "slot", spotData: null | {
//               slotId: string,
//               slotName: string,
//               status: "available" | "occupied" | "reserved" | "disabled",
//               vehicleType: string,
//               label: string,
//             }
//           },
//           ...
//         ],
//         ...
//       ]
//     }
//   ]
// }
// ============================================================

import { withAuth } from '@/utils/withAuth';
import { getLayoutsByLot } from '@/services/layoutServiceServer';
import { getSpotsByLot } from '@/services/spotService';
import { successResponse, errorResponse } from '@/utils/response';

export const GET = withAuth(async (req, { params }) => {
  try {
    const { lotId } = await params;

    // Fetch all layouts and all spots for this lot in parallel
    const [layouts, spots] = await Promise.all([
      getLayoutsByLot(lotId),
      getSpotsByLot(lotId),
    ]);

    // Build a quick lookup map: slotId -> spot data
    const spotMap = {};
    for (const spot of spots) {
      spotMap[spot.slotId] = spot;
    }

    // Enrich each layout's grid cells with live spot status
    const enrichedLayouts = layouts.map((layout) => {
      const enrichedGrid = (layout.grid || []).map((row) =>
        row.map((cell) => {
          if (cell.type !== 'slot' || !cell.spotId) return cell;

          const spot = spotMap[cell.spotId];
          if (!spot) return cell;

          return {
            ...cell,
            spotData: {
              slotId: spot.slotId,
              slotName: spot.slotName || '',
              label: spot.label || spot.slotName || cell.spotId,
              status: spot.status,          // "available" | "occupied" | etc.
              vehicleType: spot.vehicleType || 'any',
            },
          };
        })
      );

      return {
        layoutId: layout.layoutId,
        layoutName: layout.layoutName || 'Unnamed Layout',
        floor: layout.floor || '1',
        totalRows: layout.totalRows || 0,
        totalColumns: layout.totalColumns || 0,
        grid: enrichedGrid,
      };
    });

    return successResponse(enrichedLayouts);
  } catch (err) {
    console.error('GET /api/parking-lots/[lotId]/mobile-layout error:', err);
    return errorResponse(err.message, 500);
  }
});