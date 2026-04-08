"use client";

import { useEffect, useState } from "react";
import { getLayoutsByLot } from "@/services/layoutService";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const fetchLayouts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLayoutsByLot(lotId);
      setLayouts(data);
    } catch (err) {
      console.error("Error fetching layouts:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch layouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLayouts();
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
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Layouts</h2>
        <button
          onClick={fetchLayouts}
          disabled={loading}
          className="text-sm px-3 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

      {loading && <div className="text-gray-500">Loading layouts...</div>}

      {!loading && layouts.length === 0 && (
        <div className="text-gray-500 text-center py-8">No layouts found</div>
      )}

      {!loading && layouts.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Size</th>
                  <th className="px-4 py-3 text-left font-semibold">Notes</th>
                  <th className="px-4 py-3 text-left font-semibold">Created</th>
                  <th className="px-4 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {layouts.map((layout) => (
                  <tr key={layout.layoutId} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{layout.layoutName}</td>
                    <td className="px-4 py-3 text-sm">
                      {layout.totalRows} × {layout.totalColumns}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {getTruncatedNotes(layout.notes)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(layout.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleEdit(layout.layoutId)}
                        className="mx-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(layout.layoutId)}
                        className="mx-1 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
