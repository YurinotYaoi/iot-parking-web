import { useState } from "react";
import { GridType, CellType } from "@/types/layout";

const createGrid = (rows: number, cols: number): GridType => {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ type: "empty" }))
  );
};

export const useGrid = (rows: number, cols: number) => {
  const [grid, setGrid] = useState<GridType>(() =>
    createGrid(rows, cols)
  );

  const resizeGrid = (newRows: number, newCols: number) => {
    setGrid(createGrid(newRows, newCols));
  };

  const updateCell = (row: number, col: number, type: CellType) => {
    setGrid((prev) => {
      const newGrid = prev.map((r) => [...r]);

      if (!newGrid[row] || !newGrid[row][col]) return prev;

      newGrid[row][col] = {
        type,
        ...(type === "slot" && {
          slotId: `S-${row}-${col}`,
          sensorId: `sensor-${row}-${col}`,
        }),
      };

      return newGrid;
    });
  };

  return { grid, updateCell, resizeGrid };
};