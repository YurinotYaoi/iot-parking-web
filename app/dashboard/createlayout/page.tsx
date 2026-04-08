"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Grid from "@/components/layout/Grid";
import Toolbar from "@/components/layout/Toolbar";
import AvailableSpots from "@/components/layout/AvailableSpots";
import { useGrid } from "@/hooks/useGrid";
import { CellType, SpotData } from "@/models/layout";
import { createLayout } from "@/services/layoutService";
import { auth } from "@/lib/firebaseClient";

export default function CreateLayoutPage() {
  const router = useRouter();
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(8);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");

  const { grid, updateCell, resizeGrid, clearCell, getPlacedSpots } = useGrid(rows, cols);

  const [selectedTool, setSelectedTool] = useState<CellType | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<SpotData | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placedSpots = getPlacedSpots();

  const handleRowsChange = (value: number) => {
    if (value > 0) {
      setRows(value);
      resizeGrid(value, cols);
    }
  };

  const handleColsChange = (value: number) => {
    if (value > 0) {
      setCols(value);
      resizeGrid(rows, value);
    }
  };

  const handleSelectSpot = (spot: SpotData) => {
    setSelectedSpot(spot);
    setSelectedTool(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Layout name is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Not authenticated");
      }

      // For now, we'll use a default lotId; you may need to adjust this based on your context
      const lotId = "default-lot-id"; // NOTE: Get actual lotId from context/state

      const layoutData = {
        layoutName: name,
        notes,
        rows,
        cols,
        grid,
        lotId,
      };

      await createLayout(lotId, layoutData);

      // Show success message
      alert("Layout created successfully!");
      
      // Redirect to layout list
      router.push("/dashboard/layout");
    } catch (err) {
      console.error("Error saving layout:", err);
      setError(err instanceof Error ? err.message : "Failed to save layout");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
      router.push("/dashboard/layout");
    }
  };

  const handleGridClick = (rowIndex: number, colIndex: number) => {
    if (selectedSpot) {
      updateCell(rowIndex, colIndex, "slot", selectedSpot);
      setSelectedSpot(null);
    } else if (selectedTool) {
      updateCell(rowIndex, colIndex, selectedTool);
    }
  };

  return (
    <div className="p-6 h-screen flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create Layout</h1>
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Layout"}
          </button>
        </div>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* LEFT - GRID AREA */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <Toolbar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />

          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-600">
              {selectedSpot ? `Selected Spot: ${selectedSpot.slotName}` : "Select a tool or spot to place on grid"}
            </p>
            <p className="text-xs text-gray-500">Right-click to clear cells</p>
          </div>

          <Grid
            grid={grid}
            selectedTool={selectedTool}
            updateCell={(row, col) => handleGridClick(row, col)}
            clearCell={clearCell}
          />

          <div className="text-sm text-gray-600">
            Grid Size: {rows} rows × {cols} columns = {rows * cols} cells
          </div>
        </div>

        {/* RIGHT - CONTROL PANEL */}
        <div className="w-80 flex flex-col gap-6 overflow-y-auto">
          {/* LAYOUT INFO */}
          <div className="border rounded-lg p-4 bg-white">
            <h2 className="font-semibold mb-4">Layout Info</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="layout-name" className="block text-sm font-medium mb-1">Layout Name</label>
                <input
                  id="layout-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter layout name"
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label htmlFor="layout-notes" className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  id="layout-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter layout notes"
                  className="w-full border rounded px-3 py-2 h-20 resize-none"
                />
              </div>
            </div>
          </div>

          {/* GRID CONFIGURATION */}
          <div className="border rounded-lg p-4 bg-white">
            <h2 className="font-semibold mb-4">Grid Configuration</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="grid-rows" className="block text-sm font-medium mb-1">Rows</label>
                <input
                  id="grid-rows"
                  type="number"
                  min="1"
                  max="50"
                  value={rows}
                  onChange={(e) => handleRowsChange(Number(e.target.value))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label htmlFor="grid-cols" className="block text-sm font-medium mb-1">Columns</label>
                <input
                  id="grid-cols"
                  type="number"
                  min="1"
                  max="50"
                  value={cols}
                  onChange={(e) => handleColsChange(Number(e.target.value))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* AVAILABLE SPOTS */}
          <div className="border rounded-lg p-4 bg-white flex-1 overflow-hidden flex flex-col">
            <AvailableSpots
              placedSpotIds={placedSpots}
              onSelectSpot={handleSelectSpot}
            />
            {selectedSpot && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm font-medium text-blue-900">Current Selection</p>
                <p className="text-sm text-blue-800">{selectedSpot.slotName}</p>
                <small className="text-blue-600">Click on a grid cell to place it</small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}