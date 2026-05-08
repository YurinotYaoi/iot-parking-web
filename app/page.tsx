import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Activity,
  Shield,
  BarChart3,
  Cpu,
  MapPin,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "FlexPark — Smart Parking Management",
  description:
    "The brain of your smart parking lot. Track, manage, and scale your IoT infrastructure with FlexPark's intuitive real-time interface.",
};

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white dark:bg-slate-950">
      {/* Decorative background grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="pointer-events-none absolute left-1/2 top-0 -z-0 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/20" />

      <main className="relative mx-auto flex w-full max-w-7xl flex-col px-6 py-16 sm:px-10 lg:px-16 lg:py-24">
        {/* HERO */}
        <section className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-700" />
              </span>
              Real-time IoT monitoring
            </div>

            <h1 className="font-sans text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
              The brain of your{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-red-700">smart parking</span>
                <span className="absolute bottom-1 left-0 z-0 h-3 w-full bg-red-100 dark:bg-red-950/50" />
              </span>{" "}
              infrastructure
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-400">
              Track, manage, and scale your IoT-powered parking lots with
              FlexPark&apos;s intuitive real-time interface. Built for admins
              who demand control and clarity.
            </p>

            <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Link
                href="/auth/login"
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition-all hover:bg-blue-800 hover:shadow-xl hover:shadow-blue-700/30 active:translate-y-px"
              >
                Login to Dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-all hover:border-slate-400 hover:bg-slate-50 active:translate-y-px dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
              >
                Create an account
              </Link>
            </div>

            {/* Stats strip */}
            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-slate-200 pt-8 dark:border-slate-800">
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  99.9%
                </div>
                <div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                  Uptime
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  &lt;100ms
                </div>
                <div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                  Sensor latency
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  24/7
                </div>
                <div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                  Live monitoring
                </div>
              </div>
            </div>
          </div>

          {/* Right side — Dashboard preview mock */}
          <div className="relative flex items-center justify-center">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-blue-500/20 via-blue-700/20 to-red-700/10 blur-2xl" />
            <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-2xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
              {/* Mock browser bar */}
              <div className="mb-4 flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <div className="ml-3 flex-1 rounded-md bg-slate-100 px-3 py-1 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  flexpark.app/dashboard
                </div>
              </div>

              {/* Mock stats cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Occupied
                    </span>
                    <Activity className="h-3 w-3 text-blue-700" />
                  </div>
                  <div className="mt-1.5 text-xl font-bold text-slate-900 dark:text-white">
                    142
                  </div>
                  <div className="text-[10px] text-green-600 dark:text-green-400">
                    +12% today
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Available
                    </span>
                    <MapPin className="h-3 w-3 text-red-700" />
                  </div>
                  <div className="mt-1.5 text-xl font-bold text-slate-900 dark:text-white">
                    58
                  </div>
                  <div className="text-[10px] text-slate-500">of 200 spots</div>
                </div>
              </div>

              {/* Mock parking grid */}
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Lot A — Layout
                  </span>
                  <span className="flex h-1.5 w-1.5 rounded-full bg-green-500" />
                </div>
                <div className="grid grid-cols-8 gap-1">
                  {Array.from({ length: 32 }).map((_, i) => {
                    const occupied = [0, 2, 3, 7, 9, 11, 14, 17, 18, 22, 25, 28, 30].includes(i);
                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded-sm ${
                          occupied
                            ? "bg-red-700/80"
                            : "bg-blue-200 dark:bg-blue-900/50"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="mt-24 lg:mt-32">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              Built for operators
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              Everything you need to run a smart lot
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: Cpu,
                title: "IoT Sensor Network",
                description:
                  "Monitor every spot in real-time with low-latency sensor data streaming directly to your dashboard.",
              },
              {
                icon: BarChart3,
                title: "Live Analytics",
                description:
                  "Track occupancy trends, peak hours, and revenue insights with built-in dashboards.",
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description:
                  "Firebase-backed authentication, role-based access, and encrypted data at every layer.",
              },
              {
                icon: Zap,
                title: "Instant Updates",
                description:
                  "Sub-second status changes propagate from sensors to your team's screens.",
              },
              {
                icon: MapPin,
                title: "Multi-Lot Layouts",
                description:
                  "Design and manage parking lot layouts visually — rows, columns, and zones.",
              },
              {
                icon: Activity,
                title: "Health Monitoring",
                description:
                  "Get alerted the moment a sensor goes offline or behaves abnormally.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-700 group-hover:text-white dark:bg-blue-950/50 dark:text-blue-400 dark:group-hover:bg-blue-700 dark:group-hover:text-white">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-24 lg:mt-32">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-800 via-blue-900 to-slate-900 px-8 py-12 text-center sm:px-16 sm:py-16">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-red-700/20 blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to take control of your parking lot?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-blue-100">
                Sign in to your FlexPark admin dashboard and start managing
                sensors, layouts, and live data — all in one place.
              </p>
              <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-900/30 transition-all hover:bg-red-800 active:translate-y-px"
                >
                  Get started for free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 active:translate-y-px"
                >
                  I already have an account
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 sm:flex-row dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} FlexPark. Smart parking, Managed.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            By Group 7 — BSIT 3B Final Project.{" "}
          </p>
        </footer>
      </main>
    </div>
  );
}