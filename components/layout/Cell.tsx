"use client";

import { Plus } from "lucide-react";
import { CellData } from "@/models/layout";

interface Props {
  readonly data: CellData;
  readonly row: number;
  readonly column: number;
  readonly liveStatus?: string;
  readonly onClick: () => void;
  readonly onRightClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const getCellContent = (
  type: string,
  spotData: CellData["spotData"],
  status: string | undefined,
  forcedOccupied: boolean,
) => {
  if (type === "slot" && spotData) {
    const display = status ?? "—";
    return (
      <>
        <div className="flex max-w-full items-center gap-1">
          <span className="truncate font-bold text-white">{spotData.slotName}</span>
          {forcedOccupied && (
            <span
              className="shrink-0 rounded bg-white/90 px-1 py-0.5 text-[8px] font-extrabold leading-none text-red-700"
              title="Occupied by admin override"
            >
              FORCED
            </span>
          )}
        </div>
        <div className="text-white text-[10px]">{display}</div>
      </>
    );
  }
  if (type === "road") {
    return <div className="text-white font-bold">ROAD</div>;
  }
  return <Plus aria-hidden="true" className="size-4 text-slate-500" />;
};

const getColor = (type: string, status: string | undefined) => {
  if (type === "road") return "bg-gray-500 hover:bg-gray-600";
  if (type === "slot") {
    if (status === "occupied") return "bg-red-500 hover:bg-red-600";
    if (status === "reserved") return "bg-yellow-400 hover:bg-yellow-500";
    if (status === "free" || status === "available") return "bg-green-500 hover:bg-green-600";
    return "bg-blue-500 hover:bg-blue-600";
  }
  return "bg-green-100 hover:bg-green-200";
};

export default function Cell({ data, row, column, liveStatus, onClick, onRightClick }: Props) {
  const status =
    data.spotData?.forcedOccupied
      ? "occupied"
      : liveStatus === "occupied"
      ? "occupied"
      : data.spotData?.status === "reserved"
        ? "reserved"
      : liveStatus ?? data.spotData?.status;

  const handleContextMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onRightClick?.(event);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <button
      onClick={onClick}
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
      className={`
        w-full
        h-full
        min-w-0
        min-h-0
        flex
        flex-col
        items-center
        justify-center
        cursor-pointer
        transition-colors
        text-center
        p-1
        text-xs
        border-0
        rounded
        ${getColor(data.type, status)}
      `}
      aria-label={
        data.type === "empty"
          ? `Empty cell at row ${row + 1}, column ${column + 1}; click to add an available slot`
          : `Cell at row ${row + 1}, column ${column + 1}: ${data.type}${status ? `, ${status}` : ""}${data.spotData?.forcedOccupied ? ", force occupied override active" : ""}`
      }
    >
      {getCellContent(data.type, data.spotData, status, !!data.spotData?.forcedOccupied)}
    </button>
  );
}
