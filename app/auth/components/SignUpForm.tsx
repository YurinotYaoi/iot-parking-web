// components/SignupForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { Button } from "@/components/ui/button";

type FormErrors = {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
};

const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const router = useRouter();

  const clearFieldError = (field: keyof FormErrors) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!email) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Please enter a valid email address.";
    if (!firstName) errs.firstName = "First name is required.";
    if (!lastName) errs.lastName = "Last name is required.";
    if (!password) errs.password = "Password is required.";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters.";
    if (!confirmPassword) errs.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match.";
    return errs;
  };

  const handleRegister = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, middleName, lastName }),
      });

      const data = await res.json();

      if (res.status === 409) {
        setErrors({ email: "This email is already registered. Please log in instead." });
        setLoading(false);
        return;
      }

      if (res.status < 200 || res.status >= 300) {
        setErrors({ form: data.message || "Registration failed. Please try again." });
        setLoading(false);
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem("authToken", token);
      localStorage.setItem("userId", userCredential.user.uid);
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Registration error:", err);
      if (err instanceof Error && "code" in err) {
        const firebaseErr = err as { code?: string };
        switch (firebaseErr.code) {
          case "auth/email-already-in-use":
            setErrors({ email: "This email is already in use." });
            break;
          case "auth/invalid-email":
            setErrors({ email: "Invalid email address." });
            break;
          case "auth/weak-password":
            setErrors({ password: "Password is too weak. Use at least 6 characters." });
            break;
          case "auth/network-request-failed":
            setErrors({ form: "Network error. Please check your connection." });
            break;
          default:
            setErrors({ form: err instanceof Error ? err.message : "Something went wrong. Please try again." });
        }
      } else {
        setErrors({ form: "An unexpected error occurred. Please try again." });
      }
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4 w-full">
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
        <label htmlFor="firstName">First Name</label>
        <input
          type="text"
          id="firstName"
          value={firstName}
          onChange={(e) => { setFirstName(e.target.value); clearFieldError("firstName"); }}
          placeholder="John"
          disabled={loading}
          aria-invalid={!!errors.firstName}
          className={errors.firstName ? "border-destructive" : ""}
        />
        {errors.firstName && (
          <p className="flex items-center gap-1.5 text-sm text-destructive">
            <span aria-hidden="true">⚠</span> {errors.firstName}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="middleName">Middle Name</label>
        <input
          type="text"
          id="middleName"
          value={middleName}
          onChange={(e) => setMiddleName(e.target.value)}
          placeholder="(optional)"
          disabled={loading}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="lastName">Last Name</label>
        <input
          type="text"
          id="lastName"
          value={lastName}
          onChange={(e) => { setLastName(e.target.value); clearFieldError("lastName"); }}
          placeholder="Doe"
          disabled={loading}
          aria-invalid={!!errors.lastName}
          className={errors.lastName ? "border-destructive" : ""}
        />
        {errors.lastName && (
          <p className="flex items-center gap-1.5 text-sm text-destructive">
            <span aria-hidden="true">⚠</span> {errors.lastName}
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

      <div className="space-y-1">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError("confirmPassword"); }}
          placeholder="••••••••"
          disabled={loading}
          aria-invalid={!!errors.confirmPassword}
          className={errors.confirmPassword ? "border-destructive" : ""}
        />
        {errors.confirmPassword && (
          <p className="flex items-center gap-1.5 text-sm text-destructive">
            <span aria-hidden="true">⚠</span> {errors.confirmPassword}
          </p>
        )}
      </div>

      <Button
        type="button"
        className="w-full mt-2"
        onClick={handleRegister}
        disabled={loading}
      >
        {loading ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
};

export default SignUpForm;
