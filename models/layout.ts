export type CellType = "empty" | "road" | "slot";

export interface CellData {
  type: CellType;
  slotId?: string;
  sensorId?: string;
}

export type GridType = CellData[][];