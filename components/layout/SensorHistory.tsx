
'use client';

import { useEffect, useState } from 'react';
import { DataSnapshot, onValue, ref } from 'firebase/database';
import { rtdb } from '@/lib/configs/firebaseClient';

const HISTORY_PAGE_SIZE = 10;

export type HistoryEntry = {
  id: string;
  layoutId?: string;
  timestamp?: number;
  day?: string;
  hour?: number;
  totalSlots?: number;
  occupiedSlots?: number;
  vacantSlots?: number;
  occupancyRate?: number;
};

interface SensorHistoryProps {
  readonly layoutId?: string;
  readonly refreshKey?: number;
  readonly onHistoryChange?: (history: HistoryEntry[]) => void;
}


function sortByTimestamp(entries: HistoryEntry[]): HistoryEntry[] {
  return entries.sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));
}

function parseSnapshotToHistoryEntries(snapshot: DataSnapshot): HistoryEntry[] {
  const data = snapshot.val() || {};
  const entries = Object.entries(data).map(([id, value]) => ({
    id,
    ...(value as Record<string, unknown>),
  }));
  return sortByTimestamp(entries);
}


export default function SensorHistory({ layoutId, refreshKey = 0, onHistoryChange }: SensorHistoryProps ) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [showAll, setShowAll] = useState(false);

  
  useEffect(() => {
    if (!layoutId) {
      onHistoryChange?.([]);
      return;
    }

    const historyRef = ref(rtdb, `sensorHistory/${layoutId}`);
    const unsub = onValue(
      historyRef,
      (snapshot) => {
        const entries = parseSnapshotToHistoryEntries(snapshot);
        setHistory(entries);
        onHistoryChange?.(entries);
        setLoading(false);
      },
      (err) => {
        setError(err?.message || 'Unable to load sensor history');
        setLoading(false);
      }
    );

    return () => unsub();
  }, [layoutId, onHistoryChange, refreshKey]);

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '—';
    return new Date(timestamp).toLocaleString();
  };

  const formatRate = (rate?: number) => {
    if (rate === undefined || rate === null) return '—';
    return `${(rate * 100).toFixed(1)}%`;
  };

  const newestFirst = [...history].reverse();
  const totalPages = Math.max(1, Math.ceil(newestFirst.length / HISTORY_PAGE_SIZE));
  const visiblePage = Math.min(currentPage, totalPages);
  const pageStart = (visiblePage - 1) * HISTORY_PAGE_SIZE;
  const visibleEntries = showAll
    ? newestFirst
    : newestFirst.slice(pageStart, pageStart + HISTORY_PAGE_SIZE);
  const firstVisibleEntry = newestFirst.length ? (showAll ? 1 : pageStart + 1) : 0;
  const lastVisibleEntry = showAll
    ? newestFirst.length
    : Math.min(pageStart + HISTORY_PAGE_SIZE, newestFirst.length);

  const goToPage = (page: number) => {
    const nextPage = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(nextPage);
    setPageInput(String(nextPage));
    setShowAll(false);
  };

  const goToTypedPage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const requestedPage = Number.parseInt(pageInput, 10);
    goToPage(Number.isFinite(requestedPage) ? requestedPage : 1);
  };

  if (!layoutId) {
    return <div className="text-sm text-gray-500">Select a layout to view sensor history.</div>;
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
      <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/50">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">History records</h2>
      </div>

      {loading && <div className="p-4 text-sm text-gray-500">Loading history...</div>}
      {error && <div className="p-4 text-sm text-red-500">{error}</div>}

      {!loading && !error && history.length === 0 && (
        <div className="p-4 text-sm text-gray-500">No history found for this layout yet.</div>
      )}

      {!loading && history.length > 0 && (
        <>
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100 dark:bg-slate-800">
              <tr>
                <th className="border-b border-gray-300 dark:border-slate-700 px-3 py-2 text-left">Timestamp</th>
                <th className="border-b border-gray-300 dark:border-slate-700 px-3 py-2 text-left">Total</th>
                <th className="border-b border-gray-300 dark:border-slate-700 px-3 py-2 text-left">Occupied</th>
                <th className="border-b border-gray-300 dark:border-slate-700 px-3 py-2 text-left">Vacant</th>
                <th className="border-b border-gray-300 dark:border-slate-700 px-3 py-2 text-left">Occupancy</th>
              </tr>
            </thead>
            <tbody>
              {visibleEntries.map((entry) => (
                <tr key={entry.id} className="odd:bg-white even:bg-gray-50 dark:odd:bg-slate-900 dark:even:bg-slate-800">
                  <td className="border-b border-gray-200 dark:border-slate-700 px-3 py-2">{formatTime(entry.timestamp)}</td>
                  <td className="border-b border-gray-200 dark:border-slate-700 px-3 py-2">{entry.totalSlots ?? 0}</td>
                  <td className="border-b border-gray-200 dark:border-slate-700 px-3 py-2">{entry.occupiedSlots ?? 0}</td>
                  <td className="border-b border-gray-200 dark:border-slate-700 px-3 py-2">{entry.vacantSlots ?? 0}</td>
                  <td className="border-b border-gray-200 dark:border-slate-700 px-3 py-2">{formatRate(entry.occupancyRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-4 py-4 text-sm dark:border-slate-800 dark:bg-slate-950/40 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-gray-500 dark:text-gray-400">
              {showAll
                ? `Showing all ${newestFirst.length} records`
                : `Showing ${firstVisibleEntry}-${lastVisibleEntry} of ${newestFirst.length} records`}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(visiblePage - 1)}
                disabled={showAll || visiblePage === 1}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 shadow-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                Previous
              </button>
              {!showAll && (
                <form className="flex items-center gap-1" onSubmit={goToTypedPage}>
                  <label htmlFor="history-page" className="sr-only">Go to page</label>
                  <span className="text-gray-600 dark:text-gray-300">Page</span>
                  <input
                    id="history-page"
                    type="number"
                    min="1"
                    max={totalPages}
                    value={pageInput}
                    onChange={(event) => setPageInput(event.target.value)}
                    aria-label="Page number"
                    className="w-16 rounded-lg border border-slate-300 px-2 py-1.5 text-center shadow-sm dark:border-slate-600 dark:bg-slate-800"
                  />
                  <span className="text-gray-600 dark:text-gray-300">of {totalPages}</span>
                </form>
              )}
              <button
                type="button"
                onClick={() => goToPage(visiblePage + 1)}
                disabled={showAll || visiblePage === totalPages}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 shadow-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                Next
              </button>
              <button
                type="button"
                onClick={() => setShowAll((isShowingAll) => !isShowingAll)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 shadow-sm hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                {showAll ? 'Paginate' : 'View all'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}