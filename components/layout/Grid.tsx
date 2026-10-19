"use client";

import { useState } from "react";
import Cell from "./Cell";
import { GridType, LayoutTool } from "@/models/layout";
import type { SensorMap } from "@/hooks/useSensorMap";

export type GridAction =
  | Exclude<LayoutTool, "slot">
  | "occupied"
  | "sensorless"
  | "forceOccupied"
  | "clearForceOccupied";

export type SpotDetails = {
  slotName: string;
  vehicleType: string;
};

interface GridProps {
  readonly grid: GridType;
  readonly onCellClick: (row: number, col: number) => void;
  readonly onCellAction: (row: number, col: number, action: GridAction) => void;
  readonly onSpotDetailsChange: (row: number, col: number, details: SpotDetails) => void;
  readonly sensorMap?: SensorMap;
}

type ContextMenu = {
  row: number;
  col: number;
  x: number;
  y: number;
  slotName: string;
  vehicleType: string;
};

const cellActions: { value: Exclude<LayoutTool, "slot"> | "occupied"; label: string }[] = [
  { value: "empty", label: "Empty" },
  { value: "road", label: "Road" },
  { value: "available", label: "Available" },
  { value: "occupied", label: "Occupied" },
  { value: "reserved", label: "Reserved" },
];

export default function Grid({
  grid,
  onCellClick,
  onCellAction,
  onSpotDetailsChange,
  sensorMap,
}: GridProps) {
  const rows = grid.length;
  const cols = grid[0]?.length || 1;
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);

  const openContextMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    row: number,
    col: number,
  ) => {
    event.preventDefault();
    setContextMenu({
      row,
      col,
      x: Math.max(0, Math.min(event.clientX, window.innerWidth - 250)),
      y: Math.max(0, Math.min(event.clientY, window.innerHeight - 380)),
      slotName: grid[row]?.[col]?.spotData?.slotName || `Slot ${row + 1}-${col + 1}`,
      vehicleType: grid[row]?.[col]?.spotData?.vehicleType || "any",
    });
  };

  const handleAction = (action: GridAction) => {
    if (!contextMenu) return;
    onCellAction(contextMenu.row, contextMenu.col, action);
    setContextMenu(null);
  };

  const menuCell = contextMenu ? grid[contextMenu.row]?.[contextMenu.col] : undefined;
  const mountedSensorId = menuCell?.spotId
    ? sensorMap?.[menuCell.spotId]?.sensorId
    : undefined;
  const menuSensorId = mountedSensorId || menuCell?.spotData?.pendingSensorId;

  return (
    <div className="relative w-full flex-1 overflow-hidden rounded-lg border border-gray-300 bg-gray-50 dark:border-slate-700 dark:bg-slate-900">
      <div
        className="grid h-full w-full gap-0.5 p-2"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {grid.flatMap((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const liveStatus =
              cell.type === "slot" && cell.spotId
                ? sensorMap?.[cell.spotId]?.status
                : undefined;
            return (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                data={cell}
                row={rowIndex}
                column={colIndex}
                liveStatus={liveStatus}
                onClick={() => onCellClick(rowIndex, colIndex)}
                onRightClick={(event) => openContextMenu(event, rowIndex, colIndex)}
              />
            );
          })
        )}
      </div>

      {contextMenu && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close cell menu"
            onClick={() => setContextMenu(null)}
          />
          <div
            aria-label={`Cell options for row ${contextMenu.row + 1}, column ${contextMenu.col + 1}`}
            className="fixed z-50 w-60 rounded-lg border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {cellActions.map((action) => (
              <button
                key={action.value}
                type="button"
                className="w-full rounded px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => handleAction(action.value)}
              >
                {action.label}
              </button>
            ))}
            {menuCell?.type === "slot" && menuCell.spotId && (
              <div className="mt-1 border-t border-slate-200 pt-2 dark:border-slate-700">
                {mountedSensorId && (
                  <button
                    type="button"
                    className="w-full rounded px-3 py-2 text-left text-sm font-semibold text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"
                    onClick={() =>
                      handleAction(menuCell.spotData?.forcedOccupied ? "clearForceOccupied" : "forceOccupied")
                    }
                  >
                    {menuCell.spotData?.forcedOccupied ? "Clear force occupied" : "Force occupied"}
                  </button>
                )}
                <label className="mb-2 block px-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                  Slot name
                  <input
                    value={contextMenu.slotName}
                    onChange={(event) =>
                      setContextMenu({ ...contextMenu, slotName: event.target.value })
                    }
                    className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    maxLength={60}
                  />
                </label>
                <label className="mb-2 block px-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                  Vehicle type
                  <select
                    value={contextMenu.vehicleType}
                    onChange={(event) =>
                      setContextMenu({ ...contextMenu, vehicleType: event.target.value })
                    }
                    className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="any">Any vehicle</option>
                    <option value="sedan">Sedan</option>
                    <option value="motorcycle">Motorcycle</option>
                    <option value="van">Van</option>
                    <option value="truck">Truck</option>
                  </select>
                </label>
                <button
                  type="button"
                  className="w-full rounded bg-slate-900 px-3 py-2 text-left text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                  onClick={() => {
                    onSpotDetailsChange(contextMenu.row, contextMenu.col, {
                      slotName: contextMenu.slotName.trim(),
                      vehicleType: contextMenu.vehicleType,
                    });
                    setContextMenu(null);
                  }}
                  disabled={!contextMenu.slotName.trim()}
                >
                  Save slot details
                </button>
                <button
                  type="button"
                  disabled={!menuSensorId}
                  className="mt-1 w-full rounded px-3 py-2 text-left text-sm hover:bg-slate-100 disabled:cursor-default disabled:text-slate-400 dark:hover:bg-slate-800 dark:disabled:text-slate-500"
                  onClick={() => handleAction("sensorless")}
                >
                  {menuSensorId ? "Remove sensor" : "No sensor assigned"}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
