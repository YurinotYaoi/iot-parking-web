"use client";

import { CellData } from "@/models/layout";

interface Props {
  readonly data: CellData;
  readonly onClick: () => void;
  readonly onRightClick?: (e: React.MouseEvent) => void;
}

const getCellContent = (type: string, spotData?: any) => {
  if (type === "slot" && spotData) {
    return (
      <>
        <div className="font-bold text-white">{spotData.slotName}</div>
        <div className="text-white text-[10px]">{spotData.status}</div>
      </>
    );
  }
  if (type === "road") {
    return <div className="text-white font-bold">ROAD</div>;
  }
  return <div className="text-gray-500 text-xs">empty</div>;
};

const getColor = (type: string) => {
  switch (type) {
    case "road":
      return "bg-gray-500 hover:bg-gray-600";
    case "slot":
      return "bg-blue-500 hover:bg-blue-600";
    default:
      return "bg-green-100 hover:bg-green-200";
  }
};

export default function Cell({ data, onClick, onRightClick }: Props) {
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onRightClick?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
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
        ${getColor(data.type)}
      `}
      aria-label={`Cell: ${data.type}`}
    >
      {getCellContent(data.type, data.spotData)}
    </button>
  );
}