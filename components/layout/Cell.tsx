"use client";

import { CellData } from "@/types/layout";

interface Props {
  data: CellData;
  onClick: () => void;
}

export default function Cell({ data, onClick }: Props) {
  const getColor = () => {
    switch (data.type) {
      case "road":
        return "bg-gray-400";
      case "slot":
        return "bg-green-500";
      default:
        return "bg-green-200";
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        w-full 
        h-full 
        min-w-0 
        min-h-0 
        flex 
        items-center 
        justify-center 
        cursor-pointer 
        ${getColor()}
      `}
    >
      {data.type === "slot" && "P"}
    </div>
  );
}