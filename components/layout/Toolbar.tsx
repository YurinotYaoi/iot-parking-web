"use client";

import { CellType } from "@/models/layout";

interface Props {
  readonly selectedTool: CellType | null;
  readonly setSelectedTool: (tool: CellType | null) => void;
}

export default function Toolbar({ selectedTool, setSelectedTool }: Props) {
  const tools: { value: CellType; label: string }[] = [
    { value: "empty", label: "Empty" },
    { value: "road", label: "Road" },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {tools.map((tool) => (
        <button
          key={tool.value}
          onClick={() => setSelectedTool(tool.value)}
          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
            selectedTool === tool.value
              ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
              : "bg-background border-border text-foreground hover:bg-accent hover:border-primary/40"
          }`}
        >
          {tool.label}
        </button>
      ))}

      {selectedTool === null && (
        <div className="text-sm text-muted-foreground self-center">
          Select a tool (right-click to clear cells)
        </div>
      )}
    </div>
  );
}