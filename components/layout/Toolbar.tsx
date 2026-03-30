"use client";

import { CellType } from "@/types/layout";

interface Props {
  selectedTool: CellType;
  setSelectedTool: (tool: CellType) => void;
}

export default function Toolbar({ selectedTool, setSelectedTool }: Props) {
  const tools: CellType[] = ["empty", "road", "slot"];

  return (
    <div className="flex gap-2 mb-4">
      {tools.map((tool) => (
        <button
          key={tool}
          onClick={() => setSelectedTool(tool)}
          className={`px-4 py-2 border rounded ${
            selectedTool === tool ? "bg-black text-white" : ""
          }`}
        >
          {tool}
        </button>
      ))}
    </div>
  );
}