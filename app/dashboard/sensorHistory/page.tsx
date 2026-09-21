"use client";

import { Button } from "@/components/ui/button";
import SensorHistory, { HistoryEntry } from "@/components/layout/SensorHistory";
import { Spinner } from "@/components/Spinner";
import { auth } from "@/lib/configs/firebaseClient";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaCarSide, FaChartLine, FaClock, FaGaugeHigh } from "react-icons/fa6";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  AUTO_CAPTURE_MS,
  getAutoCaptureState,
  startAutoCapture,
  stopAutoCapture,
} from "@/lib/sensorHistoryAutoCapture";

interface LayoutOption {
  layoutId: string;
  layoutName: string;
}

interface AiPrediction {
  predictedOccupancy: number;
  predictedAvailableSlots: number;
  horizonMinutes: number;
  trainingRecords: number;
  metrics: {
    mae: number;
    rmse: number;
    r2: number | null;
  };
}

function buildHistoryReport(history: HistoryEntry[]) {
  const records = history
    .filter((entry) => typeof entry.timestamp === "number" && typeof entry.occupancyRate === "number")
    .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));

  if (!records.length) return null;

  const latest = records.at(-1)!;
  const latestOccupancy = Math.max(0, Math.min(1, latest.occupancyRate ?? 0));
  const recent = records.slice(-3).map((entry) => entry.occupancyRate ?? 0);
  const previous = records.slice(-6, -3).map((entry) => entry.occupancyRate ?? 0);
  const recentAverage = recent.reduce((sum, value) => sum + value, 0) / recent.length;
  const previousAverage = previous.length
    ? previous.reduce((sum, value) => sum + value, 0) / previous.length
    : recentAverage;
  const changePerRecord = recentAverage - previousAverage;
  const projectedOccupancy = Math.max(0, Math.min(1, latestOccupancy + changePerRecord * 2));

  const hourly = new Map<number, number[]>();
  records.forEach((entry) => {
    if (typeof entry.hour === "number") {
      hourly.set(entry.hour, [...(hourly.get(entry.hour) ?? []), entry.occupancyRate ?? 0]);
    }
  });
  const peak = [...hourly.entries()].sort((a, b) => {
    const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
    return average(b[1]) - average(a[1]);
  })[0];
  const peakHour = peak?.[0] ?? latest.hour ?? 0;
  const peakOccupancy = peak
    ? peak[1].reduce((sum, value) => sum + value, 0) / peak[1].length
    : latestOccupancy;
  const hourlyProfile = [...hourly.entries()]
    .map(([hour, values]) => ({
      hour,
      occupancy: values.reduce((sum, value) => sum + value, 0) / values.length,
    }))
    .sort((a, b) => a.hour - b.hour);
  let trend = "stable";
  if (changePerRecord > 0.02) trend = "rising";
  if (changePerRecord < -0.02) trend = "falling";
  const totalSlots = latest.totalSlots ?? 0;

  return {
    latestOccupancy,
    latestAvailable: latest.vacantSlots ?? Math.max(0, totalSlots - (latest.occupiedSlots ?? 0)),
    projectedOccupancy,
    projectedAvailable: Math.max(0, Math.round(totalSlots * (1 - projectedOccupancy))),
    peakHour: new Date(2020, 0, 1, peakHour).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    peakOccupancy,
    hourlyProfile,
    trend,
    sampleCount: records.length,
  };
}

export default function SensorHistoryScreen() {
  useEffect(() => {
    document.title = "Sensor History";
  }, []);

  const router = useRouter();
  const [layouts, setLayouts] = useState<LayoutOption[]>([]);
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [snapshotSaving, setSnapshotSaving] = useState(false);
  const [autoCaptureEnabled, setAutoCaptureEnabled] = useState(false);
  const [nextCaptureAt, setNextCaptureAt] = useState<number | null>(null);
  const [snapshotMessage, setSnapshotMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [aiPrediction, setAiPrediction] = useState<AiPrediction | null>(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLayouts = async () => {
      try {
        setLoading(true);
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();
        const res = await fetch("/api/layouts?lotId=default-lot-id", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        const data = Array.isArray(json?.data) ? json.data : [];
        setLayouts(data as LayoutOption[]);

        if (data.length > 0) {
          setSelectedLayoutId(data[0].layoutId);
        }
      } catch (error) {
        console.error("Failed to load layouts for history", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLayouts();
  }, []);

  const [isNavigating, startTransition] = useTransition();
  const [navTarget, setNavTarget] = useState<string | null>(null);

  const navigateTo = (path: string) => {
    setNavTarget(path);
    startTransition(() => {
      router.push(path);
    });
  };

  const isBackNav = isNavigating && navTarget === "/dashboard";

  const createHistorySnapshot = useCallback(async () => {
    if (!selectedLayoutId) return;

    try {
      setSnapshotSaving(true);
      setSnapshotMessage(null);

      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      const token = await user.getIdToken();
      const res = await fetch("/api/sensor-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ layoutId: selectedLayoutId }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Failed to create history snapshot");
      }

      setSnapshotMessage("Snapshot created successfully.");
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Create history snapshot error:", error);
      setSnapshotMessage(error instanceof Error ? error.message : "Failed to create snapshot");
    } finally {
      setSnapshotSaving(false);
    }
  }, [selectedLayoutId]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedState = getAutoCaptureState();
    if (savedState.enabled && savedState.layoutId) {
      setAutoCaptureEnabled(true);
      setSelectedLayoutId(savedState.layoutId);
      setNextCaptureAt(savedState.nextCaptureAt ?? Date.now() + AUTO_CAPTURE_MS);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!autoCaptureEnabled || !selectedLayoutId) {
      stopAutoCapture();
      setNextCaptureAt(null);
      return;
    }

    const state = getAutoCaptureState();
    if (!state.enabled || state.layoutId !== selectedLayoutId) {
      startAutoCapture(selectedLayoutId, async () => {
        await createHistorySnapshot();
      });
    }

    setNextCaptureAt(getAutoCaptureState().nextCaptureAt ?? Date.now() + AUTO_CAPTURE_MS);
  }, [autoCaptureEnabled, selectedLayoutId]);

  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const report = buildHistoryReport(history);

  const formatCompactHour = (hour: number) =>
    new Date(2020, 0, 1, hour)
      .toLocaleTimeString([], { hour: "numeric" })
      .replace(" ", "");

  useEffect(() => {
    if (!selectedLayoutId) {
      setAiPrediction(null);
      return;
    }

    const loadPrediction = async () => {
      try {
        setPredictionLoading(true);
        setPredictionError(null);
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");

        const token = await user.getIdToken();
        const response = await fetch(
          `/api/sensor-history/predict?layoutId=${encodeURIComponent(selectedLayoutId)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const json = await response.json();
        if (response.status === 422) {
          setAiPrediction(null);
          setPredictionError(json?.error || "Not enough sensor history to generate a prediction yet");
          return;
        }
        if (!response.ok) throw new Error(json?.error || "Prediction failed");
        setAiPrediction(json.data as AiPrediction);
      } catch (error) {
        console.error("Unexpected AI parking prediction error:", error);
        setAiPrediction(null);
        setPredictionError(error instanceof Error ? error.message : "Prediction unavailable");
      } finally {
        setPredictionLoading(false);
      }
    };

    loadPrediction();
  }, [selectedLayoutId, refreshKey]);

  useEffect(() => {
    if (!autoCaptureEnabled) {
      setSecondsLeft(0);
      return;
    }

    const updateCountdown = () => {
      const currentState = getAutoCaptureState();
      const nextAt = currentState.nextCaptureAt ?? Date.now() + AUTO_CAPTURE_MS;
      setNextCaptureAt(nextAt);
      setSecondsLeft(Math.max(0, Math.ceil((nextAt - Date.now()) / 1000)));
    };

    updateCountdown();
    const countdownId = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(countdownId);
  }, [autoCaptureEnabled]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-slate-50/70 dark:bg-slate-950">
      <div className="flex h-full w-screen max-w-6xl flex-col px-4 py-6">
        <div className="mb-5 flex gap-2 rounded-xl border border-slate-200 bg-white/80 p-2 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
          <Button
            onClick={() => navigateTo("/dashboard")}
            disabled={isNavigating}
            className="rounded-lg border border-transparent bg-slate-900 text-white shadow-sm transition hover:bg-white hover:text-slate-900 hover:ring-1 hover:ring-slate-300 active:translate-y-px disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            {isBackNav ? (
              <span className="inline-flex items-center gap-2">
                <Spinner size="sm" label="Going back" />
                Loading…
              </span>
            ) : (
              <>
                <FaArrowLeft className="mr-2" />
                Back
              </>
            )}
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="mb-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Sensor history</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Review parking activity and understand demand patterns over time.</p>
          </div>

          {loading ? (
            <div className="text-sm text-gray-500">Loading layouts...</div>
          ) : layouts.length === 0 ? (
            <div className="text-sm text-gray-500">No layouts found for this lot.</div>
          ) : (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <label htmlFor="layout-select" className="text-sm font-medium">
                Layout
              </label>
              <select
                id="layout-select"
                value={selectedLayoutId}
                onChange={(e) => setSelectedLayoutId(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                {layouts.map((layout) => (
                  <option key={layout.layoutId} value={layout.layoutId}>
                    {layout.layoutName}
                  </option>
                ))}
              </select>

              <Button
                onClick={() => {
                  const nextValue = !autoCaptureEnabled;
                  setAutoCaptureEnabled(nextValue);

                  if (!nextValue) {
                    stopAutoCapture();
                    setNextCaptureAt(null);
                    return;
                  }

                  if (selectedLayoutId) {
                    startAutoCapture(selectedLayoutId, async () => {
                      await createHistorySnapshot();
                    });
                    setNextCaptureAt(Date.now() + AUTO_CAPTURE_MS);
                  }
                }}
                disabled={!selectedLayoutId}
                className={`shadow-md active:shadow-inner active:translate-y-px rounded-sm border border-transparent disabled:opacity-60 ${
                  autoCaptureEnabled
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-slate-900 text-white hover:bg-white hover:text-slate-900 hover:ring-1 hover:ring-slate-300 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                }`}
              >
                {autoCaptureEnabled ? "Auto capture: On" : "Auto capture: Off"}
              </Button>

              <Button
                onClick={createHistorySnapshot}
                disabled={snapshotSaving || !selectedLayoutId}
                className="rounded-lg border border-transparent bg-slate-900 text-white shadow-sm transition hover:bg-white hover:text-slate-900 hover:ring-1 hover:ring-slate-300 active:translate-y-px disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                {snapshotSaving ? "Creating..." : "Capture now"}
              </Button>
            </div>
          )}

          {autoCaptureEnabled && nextCaptureAt && (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Next capture in {secondsLeft}s
            </div>
          )}

          {snapshotMessage && (
            <div className="text-sm text-gray-600 dark:text-gray-300">{snapshotMessage}</div>
          )}

          {report && (
            <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-md shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Overview</p>
                  <h2 className="text-lg font-bold">Parking demand</h2>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{report.sampleCount} snapshots</p>
              </div>

              {predictionLoading && (
                <div className="mb-4 overflow-hidden rounded border border-orange-200 bg-orange-50 dark:border-orange-900/60 dark:bg-orange-950/20" role="status" aria-live="polite">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <Spinner size="sm" label="Preparing your parking forecast" />
                    <p className="text-sm font-medium text-orange-950 dark:text-orange-100">Preparing forecast...</p>
                  </div>
                  <div className="h-1 w-full bg-orange-100 dark:bg-orange-950/40">
                    <div className="h-full w-1/2 animate-pulse bg-orange-500" />
                  </div>
                </div>
              )}

              {predictionError && !predictionLoading && (
                <div className="mb-4 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100" role="alert">
                  <p className="font-medium">Forecast unavailable</p>
                  <p className="mt-1">{predictionError}</p>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="min-h-24 rounded-xl border border-orange-100 border-l-4 border-l-orange-500 bg-orange-50/50 p-3 shadow-sm dark:border-orange-900/40 dark:border-l-orange-500 dark:bg-orange-950/20">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs text-gray-500">Busiest time</p>
                    <span className="flex size-7 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950/70 dark:text-orange-300"><FaClock aria-hidden="true" /></span>
                  </div>
                  <p className="mt-1 text-lg font-bold">{report.peakHour}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{(report.peakOccupancy * 100).toFixed(0)}% usually full</p>
                </div>
                {!predictionError && (predictionLoading || aiPrediction) && (
                  <>
                    <div className="min-h-24 rounded-xl border border-red-100 border-l-4 border-l-red-500 bg-red-50/50 p-3 shadow-sm dark:border-red-900/40 dark:border-l-red-500 dark:bg-red-950/20">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs text-gray-500">Expected occupancy</p>
                        <span className="flex size-7 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/70 dark:text-red-300"><FaGaugeHigh aria-hidden="true" /></span>
                      </div>
                      <div className="mt-1 text-lg font-bold">
                        {predictionLoading ? (
                          <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-300">
                            <Spinner size="sm" label="Loading expected occupancy" />
                            Loading
                          </span>
                        ) : `${((aiPrediction?.predictedOccupancy ?? 0) * 100).toFixed(0)}%`}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300">In 30 minutes</p>
                    </div>
                    <div className="min-h-24 rounded-xl border border-emerald-100 border-l-4 border-l-emerald-600 bg-emerald-50/50 p-3 shadow-sm dark:border-emerald-900/40 dark:border-l-emerald-500 dark:bg-emerald-950/20">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs text-gray-500">Expected spaces available</p>
                        <span className="flex size-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-300"><FaCarSide aria-hidden="true" /></span>
                      </div>
                      <div className="mt-1 text-lg font-bold">
                        {predictionLoading ? (
                          <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-300">
                            <Spinner size="sm" label="Loading available spaces" />
                            Loading
                          </span>
                        ) : `${aiPrediction?.predictedAvailableSlots ?? 0} slots`}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300">In 30 minutes</p>
                    </div>
                  </>
                )}
                <div className="min-h-24 rounded-xl border border-blue-100 border-l-4 border-l-blue-500 bg-blue-50/50 p-3 shadow-sm dark:border-blue-900/40 dark:border-l-blue-500 dark:bg-blue-950/20">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs text-gray-500">Recent demand</p>
                    <span className="flex size-7 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/70 dark:text-blue-300"><FaChartLine aria-hidden="true" /></span>
                  </div>
                  <p className="mt-1 text-lg font-bold capitalize">{report.trend} demand</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{report.latestAvailable} spaces now</p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/50">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950/70 dark:text-orange-300"><FaChartLine aria-hidden="true" /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Forecast signal</p>
                  <p className="truncate text-sm font-semibold capitalize text-slate-800 dark:text-slate-100">Demand is {report.trend}</p>
                </div>
                <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800" aria-label={`Current demand is ${report.trend}`}>
                  <div className={`h-full rounded-full transition-all ${report.trend === "rising" ? "w-4/5 bg-orange-500" : report.trend === "falling" ? "w-2/5 bg-blue-500" : "w-3/5 bg-emerald-500"}`} />
                </div>
              </div>

              <div className="mt-4 border-t border-gray-200 pt-3 dark:border-slate-700">
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950/50">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className="font-semibold">Occupancy by hour</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">0-100%</span>
                  </div>
                  <div className="overflow-x-auto">
                    <div className="flex h-40 min-w-[28rem] items-end gap-1 border-b border-l border-gray-300 px-2 pb-1 dark:border-slate-600" role="img" aria-label="Typical occupancy by hour">
                      {report.hourlyProfile.map(({ hour, occupancy }) => (
                        <div key={hour} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`${formatCompactHour(hour)}: ${(occupancy * 100).toFixed(0)}% occupied`}>
                          <div
                            className="w-full max-w-8 rounded-t bg-orange-500 transition-all"
                            style={{ height: `${Math.max(8, occupancy * 100)}%` }}
                          />
                          <span className="whitespace-nowrap text-center text-[10px] text-gray-500">{formatCompactHour(hour)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
              </div>
                  </div>

              <div className="mt-3 border-t border-gray-200 pt-3 text-sm text-gray-700 dark:border-slate-700 dark:text-gray-300">
                <span className="font-semibold">Summary:</span> Demand is {report.trend}; busiest around {report.peakHour}.
                {!predictionError && (
                  <span className="ml-1 text-gray-500">{aiPrediction ? `Forecast uses ${aiPrediction.trainingRecords} recent records.` : "Forecast is being prepared."}</span>
                )}
              </div>
            </section>
          )}

          {selectedLayoutId && (
            <SensorHistory
              layoutId={selectedLayoutId}
              refreshKey={refreshKey}
              onHistoryChange={setHistory}
            />
          )}
        </div>
      </div>
    </main>
  );
}