"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Grid from "@/components/layout/Grid";
import Toolbar from "@/components/layout/Toolbar";
import AvailableSpots from "@/components/layout/AvailableSpots";
import { useGrid } from "@/hooks/useGrid";
import { CellType, SpotData } from "@/models/layout";
import { createLayout } from "@/services/layoutService";
import { auth } from "@/lib/firebaseClient";
import { useSensorMap } from "@/hooks/useSensorMap";
import { Button } from "@/components/ui/button";


export default function CreateLayoutPage() {
    useEffect(() => {
    document.title = "Create Layout";
  }, []);
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
  const { sensorMap } = useSensorMap();

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
    <div className="fp-surface">
      <main className="fp-content flex flex-col w-full items-center px-3 py-4 sm:px-6">
      <div className="w-full max-w-[1600px] flex flex-col gap-3">

        <div className="flex flex-col gap-3 min-h-[calc(100vh-7rem)]">
          {/* Header with title and actions */}
          <div className="fp-panel w-full flex flex-wrap items-center gap-2 p-3 justify-between">
            <h1 className="font-bold text-lg tracking-tight text-foreground flex items-center pl-1">
              Create Layout
            </h1>
            <div className="flex gap-2">
              <Button
                onClick={handleCancel}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="px-6"
              >
                {saving ? "Saving..." : "Save Layout"}
              </Button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}


          <div className="flex flex-col lg:flex-row gap-3 flex-1 overflow-hidden">

            {/* LEFT - GRID AREA - TOOLBAR AND GRID */}
            <div className="fp-panel flex-1 flex flex-col gap-4 overflow-hidden p-4">
              <Toolbar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
              <div className="flex flex-col gap-1">
                <p className="text-sm text-foreground">
                  {selectedSpot ? `Selected Spot: ${selectedSpot.slotName}` : "Select a tool or spot to place on grid"}
                </p>
                <p className="text-xs text-muted-foreground">Right-click to clear cells</p>
              </div>

              <Grid
                grid={grid}
                selectedTool={selectedTool}
                updateCell={(row, col) => handleGridClick(row, col)}
                clearCell={clearCell}
                sensorMap={sensorMap}
              />

              <div className="text-sm text-muted-foreground">
                Grid Size: {rows} rows × {cols} columns = {rows * cols} cells
              </div>
            </div>

            {/* RIGHT - CONTROL PANEL */}
            <div className="w-full lg:w-80 flex flex-col gap-3 overflow-y-auto">
              {/* LAYOUT INFO */}
              <div className="fp-panel p-4">
                <h2 className="font-semibold mb-4 text-foreground">Layout Info</h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="layout-name" className="block text-sm font-medium mb-1.5 text-foreground">Layout Name</label>
                    <input
                      id="layout-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter layout name"
                      className="w-full rounded-lg border border-input bg-background p-2.5 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div>
                    <label htmlFor="layout-notes" className="block text-sm font-medium mb-1.5 text-foreground">Notes</label>
                    <textarea
                      id="layout-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Enter layout notes"
                      className="w-full rounded-lg border border-input bg-background p-2.5 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 h-20 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* GRID CONFIGURATION */}
              <div className="fp-panel p-4">
                <h2 className="font-semibold mb-4 text-foreground">Grid Configuration</h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="grid-rows" className="block text-sm font-medium mb-1.5 text-foreground">Rows</label>
                    <input
                      id="grid-rows"
                      type="number"
                      min="1"
                      max="50"
                      value={rows}
                      onChange={(e) => handleRowsChange(Number(e.target.value))}
                      className="w-full rounded-lg border border-input bg-background p-2.5 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div>
                    <label htmlFor="grid-cols" className="block text-sm font-medium mb-1.5 text-foreground">Columns</label>
                    <input
                      id="grid-cols"
                      type="number"
                      min="1"
                      max="50"
                      value={cols}
                      onChange={(e) => handleColsChange(Number(e.target.value))}
                      className="w-full rounded-lg border border-input bg-background p-2.5 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
              </div>

              {/* AVAILABLE SPOTS */}
              <div className="fp-panel p-4 flex-1 overflow-hidden flex flex-col">
                <AvailableSpots
                  placedSpotIds={placedSpots}
                  onSelectSpot={handleSelectSpot}
                />
                {selectedSpot && (
                  <div className="mt-4 p-3 rounded-lg border border-primary/30 bg-primary/10">
                    <p className="text-sm font-medium text-foreground">Current Selection</p>
                    <p className="text-sm text-muted-foreground">{selectedSpot.slotName}</p>
                    <small className="text-primary">Click on a grid cell to place it</small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}