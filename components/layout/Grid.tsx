"use client";

import Cell from "./Cell";
import { GridType, CellType } from "@/types/layout";

interface GridProps {
  grid: GridType;
  selectedTool: CellType;
  updateCell: (row: number, col: number, type: CellType) => void;
}

export default function Grid({
  grid,
  selectedTool,
  updateCell,
}: GridProps) {
  const rows = grid.length;
  const cols = grid[0]?.length || 1;

  return (
    <div className="w-[500px] h-[500px] border bg-gray-200 overflow-hidden">
      <div
        className="grid w-full h-full gap-0.5"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {grid.flatMap((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              data={cell}
              onClick={() =>
                updateCell(rowIndex, colIndex, selectedTool)
              }
            />
          ))
        )}
      </div>
    </div>
  );
}