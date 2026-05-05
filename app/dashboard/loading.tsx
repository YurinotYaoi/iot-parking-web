
import { Skeleton } from "@/components/Skeleton";
 
export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading dashboard…</span>
 
      {/* Header placeholder */}
      <Skeleton className="h-8 w-48" />
 
      {/* Card grid placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-200 p-4 space-y-3"
          >
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
 