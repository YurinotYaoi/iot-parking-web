// components/LoginForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { toast } from "sonner";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/dashboard");
      }
    });

    return () => unsub();
  }, []);

  const handleLogin = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const token = await cred.user.getIdToken();

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      localStorage.setItem(
        "flexpark_auth",
        JSON.stringify({ token, user: { ...data.data, password } })
      );

      toast.success("Login successful! Redirecting...");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err: unknown) {
      console.log("LOGIN ERROR:", err);

      if (err instanceof Error && "code" in err) {
        const firebaseErr = err as { code?: string };
        switch (firebaseErr.code) {
          case "auth/invalid-credential":
          case "auth/invalid-email":
            toast.error("Invalid email or password.");
            break;
          case "auth/user-disabled":
            toast.error("This account has been disabled.");
            break;
          case "auth/too-many-requests":
            toast.error("Too many failed attempts. Please try again later.");
            break;
          default:
            toast.error(err.message || "Login failed. Please try again.");
        }
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }

      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col" onSubmit={handleLogin}>
      <label htmlFor="email" className="text-sm font-medium dark:text-zinc-50">
        Email
      </label>
      <input
        type="email"
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="dark:text-zinc-50"
        disabled={loading}
      />

      <label htmlFor="password" className="text-sm font-medium dark:text-zinc-50">
        Password
      </label>
      <input
        type="password"
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="dark:text-zinc-50"
        disabled={loading}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-500 py-2 px-4 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-4 disabled:opacity-50"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

export default LoginForm;
