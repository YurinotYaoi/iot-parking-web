"use client";

import { useEffect, useState } from "react";
import { getLayoutsByLot } from "@/services/layoutService";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

interface Layout {
  layoutId: string;
  layoutName: string;
  totalRows: number;
  totalColumns: number;
  notes?: string;
  createdAt: number;
  updatedAt?: number;
  lotId?: string;
}

interface Props {
  readonly lotId?: string;
  readonly onRefresh?: () => void;
}

export default function LayoutList({ lotId = "default-lot-id", onRefresh }: Props) {
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const router = useRouter();

  const fetchLayouts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLayoutsByLot(lotId);
      setLayouts(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Error fetching layouts:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch layouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLayouts();
    const interval = setInterval(() => fetchLayouts(), 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lotId]);

  const handleEdit = (layoutId: string) => {
    router.push(`/dashboard/editlayout?id=${layoutId}`);
  };

  const handleDelete = async (layoutId: string) => {
    if (!confirm("Are you sure you want to delete this layout?")) return;

    try {
      const { deleteLayout } = await import("@/services/layoutService");
      await deleteLayout(layoutId);
      fetchLayouts(); // Refresh the list
      onRefresh?.();
    } catch (err) {
      console.error("Error deleting layout:", err);
      alert("Failed to delete layout");
    }
  };

  const getTruncatedNotes = (notes: string | undefined): string => {
    if (!notes) return "-";
    return notes.length > 30 ? notes.substring(0, 30) + "..." : notes;
  };

  return (
    <div className="max-h-[calc(100vh-12rem)] overflow-y-auto text-foreground">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-border
      bg-card/95 px-4 py-3 text-sm backdrop-blur">
        <span className="font-semibold tracking-tight">Layouts</span>
        <span className="text-xs text-muted-foreground">
          {error ? (
            <span className="text-destructive">{error}</span>
          ) : (
            `Last updated ${lastUpdated || "—"}`
          )}
        </span>
      </div>

      <div className="grid grid-cols-5 border-b border-border
      bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <div className="p-3">Name</div>
        <div className="p-3 text-center">Size</div>
        <div className="p-3 text-center">Notes</div>
        <div className="p-3 text-center">Created</div>
        <div className="p-3 text-center">Actions</div>
      </div>

      {loading && (
        <div className="p-6 text-center text-sm text-muted-foreground">Loading layouts...</div>
      )}

      {!loading && layouts.length === 0 && (
        <div className="p-6 text-center text-sm text-muted-foreground">No layouts found</div>
      )}

      {!loading && layouts.length > 0 &&
        layouts.map((layout) => (
          <div key={layout.layoutId} className="grid grid-cols-5 border-b border-border text-sm
          transition-colors hover:bg-accent/40">
            <div className="p-3 font-medium">{layout.layoutName}</div>
            <div className="p-3 text-center text-muted-foreground">
              {layout.totalRows} × {layout.totalColumns}
            </div>
            <div className="p-3 text-center text-muted-foreground">
              {getTruncatedNotes(layout.notes)}
            </div>
            <div className="p-3 text-center text-muted-foreground">
              {new Date(layout.createdAt).toLocaleDateString()}
            </div>
            <div className="p-3 flex justify-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(layout.layoutId)}
                className="grow"
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(layout.layoutId)}
                className="grow"
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
    </div>
  );
}
