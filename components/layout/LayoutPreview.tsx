"use client";

import { FaBicycle, FaCar, FaCarSide, FaLock, FaMotorcycle, FaVanShuttle } from "react-icons/fa6";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GridType } from "@/models/layout";
import { useRef, useState } from "react";

type LayoutPreviewProps = {
  readonly layoutName: string;
  readonly grid: GridType;
  readonly liveSpots?: LiveSpot[];
  readonly onEdit?: () => void;
};

type LiveSpot = {
  slotId: string;
  slotName?: string;
  vehicleType?: string;
  status?: string;
  forcedOccupied?: boolean;
  sensor?: {
    status?: string;
  } | null;
};

function getCellStyle(type: string, status?: string) {
  if (type === "road") {
    return "bg-slate-500 text-white";
  }

  if (type === "slot" && status === "occupied") {
    return "bg-red-500 text-white";
  }

  if (type === "slot" && status === "reserved") {
    return "bg-amber-400 text-amber-950";
  }

  if (type === "slot" && (status === "free" || status === "available")) {
    return "bg-emerald-500 text-white";
  }

  if (type === "slot") {
    return "bg-blue-500 text-white";
  }

  return "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500";
}

function getCellLabel(cell: GridType[number][number]) {
  if (cell.type === "road") return "ROAD";
  if (cell.type !== "slot") return "";
  return cell.spotData?.slotName || "Slot";
}

function getVehicleIcon(cell: GridType[number][number], status?: string) {
  if (status === "reserved") return <FaLock aria-label="Reserved" />;

  const vehicleType = cell.spotData?.vehicleType?.toLowerCase() || "any";
  if (vehicleType.includes("motor")) return <FaMotorcycle aria-label="Motorcycle" />;
  if (vehicleType.includes("van")) return <FaVanShuttle aria-label="Van" />;
  if (vehicleType.includes("sedan")) return <FaCarSide aria-label="Sedan" />;
  return <FaCar aria-label="Any vehicle" />;
}

export default function LayoutPreview({ layoutName, grid, liveSpots = [], onEdit }: LayoutPreviewProps) {
  const rows = grid.length;
  const columns = grid[0]?.length || 1;
  const liveSpotsById = new Map(liveSpots.map((spot) => [spot.slotId, spot]));
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ x: 0, y: 0, left: 0, top: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      left: viewport.scrollLeft,
      top: viewport.scrollTop,
    };
    viewport.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (!viewport || !isDragging) return;

    viewport.scrollLeft = dragRef.current.left - (event.clientX - dragRef.current.x);
    viewport.scrollTop = dragRef.current.top - (event.clientY - dragRef.current.y);
  };

  const stopDragging = (event: React.PointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (viewport?.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2 dark:border-slate-700 dark:bg-slate-950/50">
      {onEdit && (
        <div className="mb-1 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={onEdit}
            aria-label={`Edit ${layoutName}`}
          >
            <Pencil aria-hidden="true" />
            Edit
          </Button>
        </div>
      )}

      <div
        ref={viewportRef}
        className={`max-h-72 overflow-auto rounded-lg border border-slate-200 bg-white p-1.5 select-none touch-none dark:border-slate-700 dark:bg-slate-900 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        title="Drag to explore the parking layout"
      >
        <div
          className="grid min-w-[24rem] gap-0.5"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(2rem, 1fr))`,
          }}
          role="img"
          aria-label={`${layoutName} parking layout with ${rows} rows and ${columns} columns`}
        >
          {grid.flatMap((row, rowIndex) =>
            row.map((cell, columnIndex) => {
              const liveSpot = cell.spotId ? liveSpotsById.get(cell.spotId) : undefined;
              const displayCell = liveSpot && cell.spotData
                ? {
                    ...cell,
                    spotData: {
                      ...cell.spotData,
                      slotName: liveSpot.slotName ?? cell.spotData.slotName,
                      vehicleType: liveSpot.vehicleType ?? cell.spotData.vehicleType,
                      status: liveSpot.status ?? cell.spotData.status,
                    },
                  }
                : cell;
              const status = liveSpot?.forcedOccupied || displayCell.spotData?.forcedOccupied
                ? "occupied"
                : liveSpot?.status === "reserved"
                ? "reserved"
                : liveSpot?.sensor?.status || liveSpot?.status || displayCell.spotData?.status;
              return (
                <div
                  key={`${rowIndex}-${columnIndex}`}
                  title={`${getCellLabel(displayCell)}${status ? `: ${status}` : ""}`}
                  className={`flex min-h-8 min-w-0 items-center justify-center rounded px-0.5 text-center text-[9px] font-semibold ${getCellStyle(cell.type, status)}`}
                >
                  {cell.type === "slot" ? (
                    <span className="flex min-w-0 items-center gap-1">
                      <span className="shrink-0 text-[11px]">{getVehicleIcon(displayCell, status)}</span>
                      <span className="truncate">{getCellLabel(displayCell)}</span>
                      {(liveSpot?.forcedOccupied || displayCell.spotData?.forcedOccupied) && (
                        <span
                          title="Occupied by admin override"
                          className="shrink-0 rounded bg-white/90 px-1 py-0.5 text-[8px] font-extrabold leading-none text-red-700"
                        >
                          FORCED
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="truncate">{getCellLabel(cell)}</span>
                  )}
                </div>
              );
            }),
          )}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 dark:text-slate-400" aria-label="Parking legends">
        <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-500" />Available</span>
        <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-red-500" />Occupied</span>
        <span className="inline-flex items-center gap-1"><FaLock className="text-amber-400" /> Reserved</span>
        <span className="inline-flex items-center gap-1"><FaCarSide /> Sedan</span>
        <span className="inline-flex items-center gap-1"><FaBicycle /> Motorcycle</span>
        <span className="inline-flex items-center gap-1"><FaCar /> Any</span>
        <span className="inline-flex items-center gap-1"><FaVanShuttle /> Van</span>
      </div>
    </div>
  );
}
