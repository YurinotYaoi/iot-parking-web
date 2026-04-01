"use client";

import { useState } from "react";
import Grid from "@/components/layout/Grid";
import Toolbar from "@/components/layout/Toolbar";
import { useGrid } from "@/hooks/useGrid";
import { CellType } from "@/models/layout";

export default function CreateLayoutPage() {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(5);
  const [name, setName] = useState("");

  const { grid, updateCell, resizeGrid } = useGrid(rows, cols);

  const [selectedTool, setSelectedTool] = useState<CellType>("slot");

  const handleRowsChange = (value: number) => {
    setRows(value);
    resizeGrid(value, cols);
  };

  const handleColsChange = (value: number) => {
    setCols(value);
    resizeGrid(rows, value);
  };

  return (
    <div className="p-6 flex gap-10">
      
      {/* LEFT */}
      <div>
        <Toolbar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />

        <Grid grid={grid} selectedTool={selectedTool} updateCell={updateCell} />

        <button className="mt-4 bg-green-600 text-white px-6 py-2 rounded">
          SAVE
        </button>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex flex-col gap-4">
        
        <div>
          <p>Layout Name</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded"
          />
        </div>

        <div>
          <p>Rows</p>
          <input
            type="number"
            value={rows}
            onChange={(e) => handleRowsChange(Number(e.target.value))}
            className="border p-2 w-20"
          />
        </div>

        <div>
          <p>Columns</p>
          <input
            type="number"
            value={cols}
            onChange={(e) => handleColsChange(Number(e.target.value))}
            className="border p-2 w-20"
          />
        </div>

      </div>
    </div>
  );
}