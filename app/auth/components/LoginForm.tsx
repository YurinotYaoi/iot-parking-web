// components/LoginForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { Button } from "@/components/ui/button";

type FormErrors = {
  email?: string;
  password?: string;
  form?: string;
};

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.push("/dashboard");
    });
    return () => unsub();
  }, []);

  const clearFieldError = (field: keyof FormErrors) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  const handleLogin = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    const errs: FormErrors = {};
    if (!email) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Please enter a valid email address.";
    if (!password) errs.password = "Password is required.";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
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
        setErrors({ form: data.error || "Login failed. Please try again." });
        setLoading(false);
        return;
      }

      localStorage.setItem(
        "flexpark_auth",
        JSON.stringify({ token, user: { ...data.data, password } })
      );

      router.push("/dashboard");
    } catch (err: unknown) {
      console.log("LOGIN ERROR:", err);

      if (err instanceof Error && "code" in err) {
        const firebaseErr = err as { code?: string };
        switch (firebaseErr.code) {
          case "auth/invalid-credential":
          case "auth/invalid-email":
            setErrors({ form: "Invalid email or password." });
            break;
          case "auth/user-disabled":
            setErrors({ form: "This account has been disabled." });
            break;
          case "auth/too-many-requests":
            setErrors({ form: "Too many failed attempts. Please try again later." });
            break;
          default:
            setErrors({ form: err instanceof Error ? err.message : "Login failed. Please try again." });
        }
      } else {
        setErrors({ form: "An unexpected error occurred. Please try again." });
      }

      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4 w-full" onSubmit={handleLogin}>
      {errors.form && (
        <p className="flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <span aria-hidden="true">⚠</span> {errors.form}
        </p>
      )}

      <div className="space-y-1">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
          placeholder="you@example.com"
          disabled={loading}
          aria-invalid={!!errors.email}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && (
          <p className="flex items-center gap-1.5 text-sm text-destructive">
            <span aria-hidden="true">⚠</span> {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
          placeholder="••••••••"
          disabled={loading}
          aria-invalid={!!errors.password}
          className={errors.password ? "border-destructive" : ""}
        />
        {errors.password && (
          <p className="flex items-center gap-1.5 text-sm text-destructive">
            <span aria-hidden="true">⚠</span> {errors.password}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full mt-2" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
};

export default LoginForm;
