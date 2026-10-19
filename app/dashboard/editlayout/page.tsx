"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Grid, { type GridAction } from "@/components/layout/Grid";
import Toolbar from "@/components/layout/Toolbar";
import AvailableSensors, { type AvailableSensor } from "@/components/layout/AvailableSensors";
import { useGrid } from "@/hooks/useGrid";
import { LayoutTool, GridType } from "@/models/layout";
import { getLayoutById, updateLayout } from "@/services/layoutService";
import { auth } from "@/lib/configs/firebaseClient";
import { useSensorMap } from "@/hooks/useSensorMap";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/Skeleton";
import { Spinner } from "@/components/Spinner";
import SensorSimulate from "@/components/layout/SensorSimulate";
import {
  createGridSpotDraft,
  assignSensorToGridSpot,
  removeSensorFromGridSpot,
  setGridSpotForceOccupied,
  updateGridSpotDetails,
  updateGridSpotStatus,
} from "@/services/layoutGridService";

export default function EditLayoutPage() {
  useEffect(() => {
    document.title = "Edit Layout";
  }, []);
  const router = useRouter();
  const searchParams = useSearchParams();
  const layoutId = searchParams.get("id");

  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(8);
  const [rowsInput, setRowsInput] = useState("5");
  const [colsInput, setColsInput] = useState("8");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [initialGrid, setInitialGrid] = useState<GridType | null>(null);

  const {
    grid,
    updateCell,
    updateCellStatus,
    updateSpotDetails,
    resizeGrid,
    clearCell,
  } = useGrid(rows, cols, initialGrid || undefined);

  const [selectedTool, setSelectedTool] = useState<LayoutTool | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<AvailableSensor | null>(null);
  const [saving, setSaving] = useState(false);
  const [spotsRefreshKey, setSpotsRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const { sensorMap } = useSensorMap();
  const pendingSensorIds = grid.flatMap((row) =>
    row.flatMap((cell) => cell.spotData?.pendingSensorId || [])
  );

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
        setRowsInput(String(rowCount));
        setColsInput(String(colCount));

        if (data.grid) {
          setInitialGrid(data.grid);
        }
      } catch (error) {
        console.error("Error fetching layout:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch layout");
      } finally {
        setLoading(false);
      }
    };

    fetchLayout();
  }, [layoutId]);

  const handleRowsChange = () => {
    const value = Number(rowsInput);
    if (Number.isInteger(value) && value > 0 && value <= 50) {
      setRows(value);
      setRowsInput(String(value));
      resizeGrid(value, cols);
    } else {
      setRowsInput(String(rows));
    }
  };

  const handleColsChange = () => {
    const value = Number(colsInput);
    if (Number.isInteger(value) && value > 0 && value <= 50) {
      setCols(value);
      setColsInput(String(value));
      resizeGrid(rows, value);
    } else {
      setColsInput(String(cols));
    }
  };

  const handleSelectSensor = (sensor: AvailableSensor) => {
    setSelectedSensor(sensor);
    setSelectedTool(null);
  };

  const handleGridCellAction = async (rowIndex: number, colIndex: number, action: GridAction) => {
    const cell = grid[rowIndex]?.[colIndex];

    if (action === "sensorless") {
      if (cell?.spotData?.isDraft && cell.spotData.pendingSensorId) {
        updateSpotDetails(rowIndex, colIndex, { pendingSensorId: undefined });
        toast.success("Sensor assignment removed from draft slot.");
        return;
      }
      const sensorId = cell?.spotId ? sensorMap[cell.spotId]?.sensorId : undefined;
      if (!sensorId) {
        toast.info("This slot has no sensor assigned.");
        return;
      }
      try {
        await removeSensorFromGridSpot(sensorId);
        setSpotsRefreshKey((current) => current + 1);
        toast.success("Sensor removed from slot.");
      } catch (error) {
        console.error("Failed to remove sensor from slot:", error);
        const message = error instanceof Error ? error.message : "Failed to remove sensor from slot";
        setError(message);
        toast.error(message);
      }
      return;
    }

    if (action === "forceOccupied" || action === "clearForceOccupied") {
      if (!cell?.spotId || cell.spotData?.isDraft || !sensorMap[cell.spotId]?.sensorId) {
        toast.error("Force occupied is only available for slots with an assigned sensor.");
        return;
      }
      const forced = action === "forceOccupied";
      try {
        await setGridSpotForceOccupied(cell.spotId, forced);
        updateCellStatus(rowIndex, colIndex, forced ? "occupied" : "available");
        updateSpotDetails(rowIndex, colIndex, { forcedOccupied: forced });
        toast.success(forced ? "Slot forced occupied." : "Force occupied cleared.");
      } catch (error) {
        console.error("Failed to update force occupied override:", error);
        const message = error instanceof Error ? error.message : "Failed to update force occupied override";
        setError(message);
        toast.error(message);
      }
      return;
    }

    if (action === "empty") {
      clearCell(rowIndex, colIndex);
      return;
    }

    if (action === "road") {
      updateCell(rowIndex, colIndex, "road");
      return;
    }

    try {
      if (cell?.type === "slot" && cell.spotId) {
        if (cell.spotData?.isDraft) {
          updateCellStatus(rowIndex, colIndex, action);
          return;
        }
        await updateGridSpotStatus(cell.spotId, action);
        updateCellStatus(rowIndex, colIndex, action);
        toast.success(`${cell.spotData?.slotName || "Slot"} marked ${action}`);
      } else {
        const spot = createGridSpotDraft(rowIndex, colIndex, action, layoutId || undefined);
        updateCell(rowIndex, colIndex, "slot", spot);
        toast.success(`${spot.slotName} added as ${action}`);
      }
    } catch (error) {
      console.error("Failed to update parking grid:", error);
      const message = error instanceof Error ? error.message : "Failed to update parking grid";
      setError(message);
      toast.error(message);
    }
  };

  const handleGridCellClick = (rowIndex: number, colIndex: number) => {
    if (selectedSensor) {
      const cell = grid[rowIndex]?.[colIndex];
      if (cell?.type !== "slot" || !cell.spotId) {
        toast.error("Select a parking slot to assign this sensor.");
        return;
      }
      if (cell.spotData?.isDraft) {
        updateSpotDetails(rowIndex, colIndex, { pendingSensorId: selectedSensor.sensorId });
        setSelectedSensor(null);
        toast.success(`${selectedSensor.deviceId} will be assigned when the layout is saved.`);
        return;
      }
      void assignSensorToGridSpot(selectedSensor.sensorId, cell.spotId)
        .then(() => {
          setSelectedSensor(null);
          setSpotsRefreshKey((current) => current + 1);
          toast.success(`${selectedSensor.deviceId} assigned to ${cell.spotData?.slotName || "slot"}.`);
        })
        .catch((error: unknown) => {
          console.error("Failed to assign sensor to slot:", error);
          const message = error instanceof Error ? error.message : "Failed to assign sensor";
          setError(message);
          toast.error(message);
        });
    } else if (selectedTool && selectedTool !== "slot") {
      void handleGridCellAction(rowIndex, colIndex, selectedTool);
    } else if (grid[rowIndex]?.[colIndex]?.type === "empty") {
      void handleGridCellAction(rowIndex, colIndex, "available");
    }
  };

  const handleSpotDetailsChange = async (
    rowIndex: number,
    colIndex: number,
    details: { slotName: string; vehicleType: string },
  ) => {
    const cell = grid[rowIndex]?.[colIndex];
    if (!cell?.spotId) return;

    try {
      if (cell.spotData?.isDraft) {
        updateSpotDetails(rowIndex, colIndex, details);
        toast.success("Draft slot details saved.");
        return;
      }
      await updateGridSpotDetails(cell.spotId, details);
      updateSpotDetails(rowIndex, colIndex, details);
      setSpotsRefreshKey((current) => current + 1);
      toast.success("Slot details saved.");
    } catch (error) {
      console.error("Failed to update slot details:", error);
      const message = error instanceof Error ? error.message : "Failed to update slot details";
      setError(message);
      toast.error(message);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setNameError("Layout name is required");
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

      toast.success("Layout updated successfully!");
      router.push("/dashboard/layout");
    } catch (error) {
      console.error("Error saving layout:", error);
      setError(error instanceof Error ? error.message : "Failed to save layout");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    toast("Unsaved changes will be lost.", {
      action: { label: "Leave anyway", onClick: () => router.push("/dashboard/layout") },
      cancel: { label: "Stay", onClick: () => {} },
    });
  };

  // ── Skeleton view: mirrors the real layout's structure ───────────────────
  if (loading) {
    return (
      <main
        className="flex flex-col w-full items-center justify-center"
        aria-busy="true"
        aria-live="polite"
      >
        <span className="sr-only">Loading layout…</span>
        <div className="w-screen max-w-600 flex-rows h-213">
          <div className="p-2 flex flex-col gap-6 dark:text-slate-100 dark:bg-slate-950 h-213">
            {/* Header skeleton */}
            <div className="w-full flex border-2 border-gray-800 rounded-md p-1 justify-between items-center">
              <Skeleton className="h-7 w-32 ml-2" />
              <div className="flex gap-1">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-32" />
              </div>
            </div>

            <div className="flex gap-6 flex-1 overflow-hidden">
              {/* LEFT skeleton — toolbar + grid */}
              <div className="flex-1 flex flex-col gap-4 border-2 border-gray-800 rounded-md p-2">
                <Skeleton className="h-10 w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                {/* Faux grid */}
                <div className="grid grid-cols-8 gap-1">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square w-full" />
                  ))}
                </div>
                <Skeleton className="h-4 w-1/2" />
              </div>

              {/* RIGHT skeleton — control panel */}
              <div className="w-80 flex flex-col gap-6">
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-slate-900 dark:border-slate-700 space-y-4">
                  <Skeleton className="h-5 w-28" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-slate-900 dark:border-slate-700 space-y-4">
                  <Skeleton className="h-5 w-36" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-slate-900 dark:border-slate-700 space-y-3">
                  <Skeleton className="h-5 w-32" />
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!layoutId) {
    return (
      <div className="p-6 flex items-center justify-center h-screen dark:bg-slate-950">
        <div className="text-lg text-red-600 dark:text-red-400">No layout ID provided</div>
      </div>
    );
  }

  return (
    <main className="flex flex-col w-full items-center justify-center">
      <div className="w-screen max-w-600 flex-rows h-213">

        <div className="p-2 flex flex-col gap-6 dark:text-slate-100 dark:bg-slate-950 h-213">
          {/* Header with title and actions */}
          <div className="w-full flex border-2 border-gray-800 rounded-md p-1 justify-between">
            <h1 className="font-bold dark:text-slate-100 h-full flex items-center pl-2">
              Edit Layout
            </h1>
            <div className="flex gap-1">
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="shadow-md active:shadow-inner active:translate-y-px px-6 py-2 bg-black text-white hover:bg-white hover:text-black hover:border-black border border-transparent dark:bg-white dark:text-black dark:hover:bg-slate-800 dark:hover:text-white dark:hover:border-white disabled:opacity-50"
              >
                {saving ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner size="sm" label="Saving" />
                    Saving…
                  </span>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-100 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-6 flex-1 overflow-hidden ">
            {/* LEFT - GRID AREA - TOOLBAR AND GRID */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden border-2 border-gray-800 rounded-md p-2">
              <Toolbar
                selectedTool={selectedTool}
                setSelectedTool={(tool) => {
                  setSelectedTool(tool);
                  setSelectedSensor(null);
                }}
              />
              <div className="flex flex-col gap-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedSensor
                    ? `Selected Sensor: ${selectedSensor.deviceId} — click a slot to assign`
                    : "Select a tool or sensor, or right-click a cell to change it"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Click + to add a sensorless slot. Right-click any cell to change it.</p>
              </div>

              <Grid
                grid={grid}
                onCellClick={handleGridCellClick}
                onCellAction={(row, col, action) => void handleGridCellAction(row, col, action)}
                onSpotDetailsChange={(row, col, details) =>
                  void handleSpotDetailsChange(row, col, details)
                }
                sensorMap={sensorMap}
              />

              <div className="text-sm text-slate-600 dark:text-slate-400">
                Grid Size: {rows} rows × {cols} columns = {rows * cols} cells
              </div>
            </div>

            {/* RIGHT - CONTROL PANEL */}
            <div className="w-80 flex-col gap-6 overflow-y-auto dark:text-slate-100">
              {/* LAYOUT INFO */}
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-slate-900 dark:border-slate-700">
                <h2 className="font-semibold mb-4 dark:text-slate-100">Layout Info</h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="layout-name" className="block text-sm font-medium mb-1 dark:text-slate-100">Layout Name</label>
                    <input
                      id="layout-name"
                      value={name}
                      onChange={(event) => { setName(event.target.value); setNameError(null); }}
                      placeholder="Enter layout name"
                      aria-invalid={!!nameError}
                      className={`w-full rounded-md border p-2 text-sm text-slate-900 shadow-sm outline-none transition dark:bg-slate-800 dark:text-slate-100 ${nameError ? "border-destructive" : "border-slate-300 bg-white focus:border-slate-500 dark:border-slate-700"}`}
                    />
                    {nameError && (
                      <p className="flex items-center gap-1.5 text-sm text-destructive mt-1">
                        <span aria-hidden="true">⚠</span> {nameError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="layout-notes" className="block text-sm font-medium mb-1 dark:text-slate-100">Notes</label>
                    <textarea
                      id="layout-notes"
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Enter layout notes"
                      className="w-full rounded-md border border-slate-300 bg-white p-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 h-20 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* GRID CONFIGURATION */}
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-slate-900 dark:border-slate-700">
                <h2 className="font-semibold mb-4 dark:text-slate-100">Grid Configuration</h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="grid-rows" className="block text-sm font-medium mb-1 dark:text-slate-100">Rows</label>
                    <input
                      id="grid-rows"
                      type="number"
                      min="1"
                      max="50"
                      value={rowsInput}
                      onChange={(event) => setRowsInput(event.target.value)}
                      onBlur={handleRowsChange}
                      className="w-full rounded-md border border-slate-300 bg-white p-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="grid-cols" className="block text-sm font-medium mb-1 dark:text-slate-100">Columns</label>
                    <input
                      id="grid-cols"
                      type="number"
                      min="1"
                      max="50"
                      value={colsInput}
                      onChange={(event) => setColsInput(event.target.value)}
                      onBlur={handleColsChange}
                      className="w-full rounded-md border border-slate-300 bg-white p-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* AVAILABLE SENSORS */}
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-slate-900 dark:border-slate-700 flex-1 overflow-hidden flex flex-col">
                <AvailableSensors
                  key={spotsRefreshKey}
                  selectedSensorId={selectedSensor?.sensorId}
                  assignedSensorIds={pendingSensorIds}
                  onSelectSensor={handleSelectSensor}
                />
              </div>





            </div>
          </div>
        </div>
      </div>
    </main>
  );
}