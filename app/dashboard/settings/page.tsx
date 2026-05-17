"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  Check,
  AlertCircle,
  Save,
} from "lucide-react";

export default function SettingsPage() {
  useEffect(() => {
    document.title = "Settings | FlexPark";
  }, []);

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    password: "",
  });

  // Auto-dismiss toast after 3.5s
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  useEffect(() => {
    // First, try to get user data from localStorage and set it immediately
    const authData = JSON.parse(localStorage.getItem("flexpark_auth") || "{}");
    if (authData.user) {
      setUser({
        firstName: authData.user.firstName || "",
        lastName: authData.user.lastName || "",
        middleName: authData.user.middleName || "",
        email: authData.user.email || "",
        password: authData.user.password || "",
      });
    }

    // Then fetch fresh data from API
    const fetchUser = async () => {
      try {
        const token = authData.token;

        if (!token) {
          router.push("/auth/login");
          return;
        }

        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await response.json();

        if (response.ok && result.success) {
          const data = result.data;
          setUser((prev) => ({
            firstName: data.firstName || prev.firstName,
            lastName: data.lastName || prev.lastName,
            middleName: data.middleName || prev.middleName,
            email: data.email || prev.email,
            password: prev.password, // Keep existing password
          }));
        } else if (response.status === 401) {
          router.push("/auth/login");
        } else {
          console.error("Error fetching user:", result.error);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const authData = JSON.parse(localStorage.getItem("flexpark_auth") || "{}");
    const token = authData.token;
    const uid = authData.user?.uid;

    if (!uid) {
      setToast({ type: "error", message: "User ID not found" });
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch(`/api/users/${uid}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: user.firstName,
          lastName: user.lastName,
          middleName: user.middleName,
          email: user.email,
          password: user.password,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        // Update localStorage with new user data including password
        localStorage.setItem(
          "flexpark_auth",
          JSON.stringify({
            token,
            user: { ...data.data, password: user.password },
          })
        );
        setToast({ type: "success", message: "Profile updated successfully" });
        setTimeout(() => router.push("/dashboard"), 1200);
      } else {
        setToast({
          type: "error",
          message: data.error || "Failed to update profile",
        });
      }
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Get initials for avatar
  const initials =
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() ||
    "FP";
  const fullName =
    `${user.firstName} ${user.lastName}`.trim() || "Your Profile";

  if (isLoading) {
    return (
      <div className="fp-surface flex items-center justify-center">
        <div className="fp-content flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading your profile…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fp-surface">
      <div className="fp-content">
      {/* Toast notification */}
      {toast && (
        <div className="fixed right-6 top-6 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm ${
              toast.type === "success"
                ? "border-green-200 bg-green-50/95 text-green-800 dark:border-green-900/50 dark:bg-green-950/80 dark:text-green-300"
                : "border-red-200 bg-red-50/95 text-red-800 dark:border-red-900/50 dark:bg-red-950/80 dark:text-red-300"
            }`}
          >
            {toast.type === "success" ? (
              <Check className="h-4 w-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl px-6 py-10 sm:px-10 lg:py-12">
        {/* Back link */}
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Account Settings
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Manage your profile information and account preferences.
          </p>
        </div>

        {/* Profile card */}
        <div className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {/* Banner */}
          <div className="relative h-24 bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-red-700/20 blur-2xl" />
          </div>

          {/* Avatar + name */}
          <div className="relative px-6 pb-6">
            <div className="-mt-10 flex items-end gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-blue-700 text-2xl font-bold text-white shadow-lg dark:border-slate-900">
                {initials}
              </div>
              <div className="pb-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {fullName}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {user.email || "No email set"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info Section */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Personal Information
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Update your name details. This will appear across your
                FlexPark account.
              </p>
            </div>

            <div className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <SettingsField
                  icon={User}
                  id="firstName"
                  label="First name"
                  value={user.firstName}
                  onChange={(v) => setUser({ ...user, firstName: v })}
                  placeholder="John"
                />
                <SettingsField
                  icon={User}
                  id="lastName"
                  label="Last name"
                  value={user.lastName}
                  onChange={(v) => setUser({ ...user, lastName: v })}
                  placeholder="Doe"
                />
              </div>
              <SettingsField
                icon={User}
                id="middleName"
                label="Middle name"
                value={user.middleName}
                onChange={(v) => setUser({ ...user, middleName: v })}
                placeholder="(optional)"
                optional
              />
            </div>
          </div>

          {/* Account Section */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Account & Security
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Your sign-in credentials. Be careful when updating these.
              </p>
            </div>

            <div className="space-y-5 p-6">
              <SettingsField
                icon={Mail}
                id="email"
                type="email"
                label="Email address"
                value={user.email}
                onChange={(v) => setUser({ ...user, email: v })}
                placeholder="you@company.com"
              />

              {/* Password with toggle */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={user.password}
                    onChange={(e) =>
                      setUser({ ...user, password: e.target.value })
                    }
                    placeholder="Enter a new password"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-300"
                    tabIndex={-1}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Leave unchanged to keep your current password.
                </p>
              </div>
            </div>
          </div>

          {/* Action bar */}
          <div className="sticky bottom-0 -mx-6 flex flex-col-reverse items-stretch gap-3 border-t border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md sm:mx-0 sm:flex-row sm:items-center sm:justify-end sm:rounded-xl sm:border sm:bg-white sm:shadow-sm dark:border-slate-800 dark:bg-slate-900/80 sm:dark:bg-slate-900">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              disabled={isSaving}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 active:translate-y-px disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white shadow-md shadow-blue-700/20 transition-all hover:bg-blue-800 hover:shadow-lg hover:shadow-blue-700/30 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}

// Reusable field component
interface SettingsFieldProps {
  icon: React.ComponentType<{ className?: string }>;
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  optional?: boolean;
}

const SettingsField = ({
  icon: Icon,
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  optional,
}: SettingsFieldProps) => (
  <div className="flex flex-col gap-1.5">
    <label
      htmlFor={id}
      className="text-sm font-medium text-slate-700 dark:text-slate-300"
    >
      {label}
      {optional && (
        <span className="ml-1.5 text-xs font-normal text-slate-400">
          (optional)
        </span>
      )}
    </label>
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500"
      />
    </div>
  </div>
);