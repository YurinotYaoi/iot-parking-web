// components/LoginForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import { useToast } from "@/components/Toast";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/dashboard");
      }
    });

    return () => unsub();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      showToast("Please fill in all fields.", "error");
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
        showToast(data.error || "Login failed. Please try again.", "error");
        setLoading(false);
        return;
      }

      localStorage.setItem(
        "flexpark_auth",
        JSON.stringify({ token, user: { ...data.data, password } })
      );

      showToast("Login successful! Redirecting...", "success");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err: unknown) {
      console.log("LOGIN ERROR:", err);

      // Map Firebase error codes to user-friendly messages
      if (err instanceof Error && "code" in err) {
        const firebaseErr = err as { code?: string };
        switch (firebaseErr.code) {
          case "auth/user-not-found":
            showToast("No account found with this email.", "error");
            break;
          case "auth/wrong-password":
            showToast("Incorrect password. Please try again.", "error");
            break;
          case "auth/invalid-email":
            showToast("Invalid email address.", "error");
            break;
          case "auth/user-disabled":
            showToast("This account has been disabled.", "error");
            break;
          case "auth/too-many-requests":
            showToast("Too many failed attempts. Please try again later.", "error");
            break;
          case "auth/invalid-credential":
            showToast("Invalid email or password.", "error");
            break;
          default:
            showToast(err.message || "Login failed. Please try again.", "error");
        }
      } else {
        showToast("An unexpected error occurred. Please try again.", "error");
      }

      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
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
    </>
  );
};

export default LoginForm;