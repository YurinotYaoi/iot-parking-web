"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Grid from "@/components/layout/Grid";
import Toolbar from "@/components/layout/Toolbar";
import AvailableSpots from "@/components/layout/AvailableSpots";
import { useGrid } from "@/hooks/useGrid";
import { CellType, SpotData, GridType } from "@/models/layout";
import { getLayoutById, updateLayout } from "@/services/layoutService";
import { auth } from "@/lib/firebaseClient";
import { useSensorMap } from "@/hooks/useSensorMap";
import { Button } from "@/components/ui/button";

export default function EditLayoutPage() {
    useEffect(() => {
    document.title = "Edit Layout";
  }, []);
  const router = useRouter();
  const searchParams = useSearchParams();
  const layoutId = searchParams.get("id");

  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(8);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [initialGrid, setInitialGrid] = useState<GridType | null>(null);

  const { grid, updateCell, resizeGrid, clearCell, getPlacedSpots } = useGrid(
    rows,
    cols,
    initialGrid || undefined
  );

  const [selectedTool, setSelectedTool] = useState<CellType | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<SpotData | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { sensorMap } = useSensorMap();

  const placedSpots = getPlacedSpots();

  // Fetch layout data
  useEffect(() => {
    if (!layoutId) {
      setError("No layout ID provided");
      setLoading(false);
      return;
    }

    const fetchLayout = async () => {
      try {
        const data = await getLayoutById(layoutId);
        if (!data) {
          throw new Error("Layout not found");
        }

        setName(data.layoutName || "");
        setNotes(data.notes || "");
        const rowCount = data.totalRows || 5;
        const colCount = data.totalColumns || 8;
        setRows(rowCount);
        setCols(colCount);

        if (data.grid) {
          setInitialGrid(data.grid);
        }
      } catch (err) {
        console.error("Error fetching layout:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch layout");
      } finally {
        setLoading(false);
      }
    };

    fetchLayout();
  }, [layoutId]);

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

  const handleGridCellClick = (rowIndex: number, colIndex: number) => {
    if (selectedSpot) {
      updateCell(rowIndex, colIndex, "slot", selectedSpot);
      setSelectedSpot(null);
    } else if (selectedTool) {
      updateCell(rowIndex, colIndex, selectedTool);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Layout name is required");
      return;
    }

    if (!layoutId) {
      setError("No layout ID found");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Not authenticated");
      }

      const updates = {
        layoutName: name,
        notes,
        totalRows: rows,
        totalColumns: cols,
        grid,
      };

      await updateLayout(layoutId, updates);

      alert("Layout updated successfully!");
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

  if (loading) {
    return (
      <div className="fp-surface">
        <div className="fp-content p-6 flex items-center justify-center min-h-screen">
          <div className="text-lg text-muted-foreground animate-pulse">Loading layout...</div>
        </div>
      </div>
    );
  }

  if (!layoutId) {
    return (
      <div className="fp-surface">
        <div className="fp-content p-6 flex items-center justify-center min-h-screen">
          <div className="text-lg text-destructive">No layout ID provided</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fp-surface">
      <main className="fp-content flex flex-col w-full items-center px-3 py-4 sm:px-6">
      <div className="w-full max-w-[1600px] flex flex-col gap-3">

        <div className="flex flex-col gap-3 min-h-[calc(100vh-7rem)]">
          {/* Header with title and actions */}
          <div className="fp-panel w-full flex flex-wrap items-center gap-2 p-3 justify-between">
            <h1 className="font-bold text-lg tracking-tight text-foreground flex items-center pl-1">
              Edit Layout
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
                {saving ? "Saving..." : "Save Changes"}
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
                updateCell={(row, col) => handleGridCellClick(row, col)}
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
                  currentLayoutId={layoutId}
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
