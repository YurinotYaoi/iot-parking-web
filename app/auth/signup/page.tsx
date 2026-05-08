import SignUpForm from "../components/SignUpForm";
import AuthBrandPanel from "../components/AuthBrandPanel";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up | FlexPark",
};

export default function SignupScreen() {
  return (
    <main className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
      {/* LEFT — FORM */}
      <div className="relative flex flex-col justify-center bg-white px-6 py-12 sm:px-12 lg:px-16 dark:bg-slate-950">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile-only brand mark */}
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-2 lg:hidden"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
              </svg>
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              FlexPark
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Get started with FlexPark in under a minute. No credit card required.
            </p>
          </div>

          <SignUpForm />

          <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-blue-700 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT — BRAND PANEL */}
      <AuthBrandPanel variant="signup" />
    </main>
  );
}