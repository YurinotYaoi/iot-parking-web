import { CheckCircle2, Activity, Zap, Shield } from "lucide-react";

interface AuthBrandPanelProps {
  variant?: "login" | "signup";
}

const AuthBrandPanel = ({ variant = "login" }: AuthBrandPanelProps) => {
  const features =
    variant === "signup"
      ? [
          "Free admin dashboard, no setup fees",
          "Real-time IoT sensor monitoring",
          "Visual parking lot layout designer",
          "Enterprise-grade Firebase security",
        ]
      : [
          "142 active sensors monitored",
          "Sub-100ms data refresh rate",
          "Multi-lot management at a glance",
          "24/7 system health monitoring",
        ];

  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-800 via-blue-900 to-slate-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
      {/* Decorative grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Glow accents */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-red-700/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

      {/* Top — Brand mark */}
      <div className="relative flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white backdrop-blur-sm ring-1 ring-white/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
          </svg>
        </span>
        <span className="text-xl font-bold tracking-tight text-white">
          FlexPark
        </span>
      </div>

      {/* Middle — Headline + features */}
      <div className="relative max-w-md">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-blue-100 backdrop-blur-sm">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
          </span>
          {variant === "signup" ? "Join 1,200+ admins" : "Live system online"}
        </div>

        <h2 className="text-3xl font-bold leading-tight text-white xl:text-4xl">
          {variant === "signup"
            ? "Smart parking starts here."
            : "Your parking lot, in real-time."}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-blue-100/80">
          {variant === "signup"
            ? "Join the operators using FlexPark to manage their IoT-powered parking infrastructure with ease."
            : "Welcome back. Pick up right where you left off and keep your operations running smoothly."}
        </p>

        <ul className="mt-8 space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm text-blue-50">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom — Live stats */}
      <div className="relative grid grid-cols-3 gap-3">
        <StatCard icon={Activity} label="Uptime" value="99.9%" />
        <StatCard icon={Zap} label="Latency" value="<100ms" />
        <StatCard icon={Shield} label="Encrypted" value="256-bit" />
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

const StatCard = ({ icon: Icon, label, value }: StatCardProps) => (
  <div className="rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
    <Icon className="h-4 w-4 text-blue-300" />
    <div className="mt-2 text-lg font-bold text-white">{value}</div>
    <div className="text-[10px] font-medium uppercase tracking-wider text-blue-200/70">
      {label}
    </div>
  </div>
);

export default AuthBrandPanel;