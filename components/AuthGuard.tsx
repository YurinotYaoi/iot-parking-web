"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { auth } from "@/lib/configs/firebaseClient";

type AuthGuardProps = {
  children: React.ReactNode;
  mode?: "protected" | "guest";
};

export default function AuthGuard({ children, mode = "protected" }: AuthGuardProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authResolved, setAuthResolved] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthResolved(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!authResolved) return;

    if (mode === "protected" && !user) {
      router.replace("/auth/login");
    }

    if (mode === "guest" && user) {
      router.replace("/dashboard");
    }
  }, [authResolved, mode, router, user]);

  const accessAllowed = mode === "protected" ? Boolean(user) : !user;

  if (!authResolved || !accessAllowed) {
    return (
      <main className="flex min-h-[40vh] items-center justify-center px-6" role="status" aria-label="Loading">
        <div className="relative flex size-16 items-center justify-center" aria-hidden="true">
          <div className="absolute size-16 animate-ping rounded-full bg-orange-400/20" />
          <div className="absolute size-11 animate-pulse rounded-full bg-orange-500/20" />
          <div className="size-3 rounded-full bg-orange-500 shadow-[0_0_0_6px_rgba(249,115,22,0.12)]" />
        </div>
        <span className="sr-only">Loading your account</span>
      </main>
    );
  }

  return children;
}