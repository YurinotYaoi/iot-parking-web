import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/utils/withAuth";
import { createSpot } from "@/services/spotService";

export const POST = withAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    if (!body) throw new Error("Missing request body");

    const { slotName, vehicleType, rowNo, columnNo, layoutId, lotId, floor } = body;

    if (!slotName || !vehicleType) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const userId = (req as any).user.uid;

    // Create spot in Firebase; layout values can be assigned later
    const spot = await createSpot({
      slotName,
      vehicleType,
      rowNo: rowNo ?? '',
      columnNo: columnNo ?? '',
      layoutId: layoutId ?? '',
      lotId: lotId ?? '',
      floor: floor ?? '',
      status: "available",
      ownerId: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return NextResponse.json({ message: "Spot created", data: spot }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/spots error:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
});