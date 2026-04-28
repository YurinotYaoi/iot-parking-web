// components/SignupForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useToast } from "@/components/Toast";

const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { showToast, ToastContainer } = useToast();

  const handleRegister = async () => {
    // Client-side validation
    if (!email || !firstName || !lastName || !password || !confirmPassword) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }

    setLoading(true);

    try {
      // 1. Register user via API
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          middleName,
          lastName,
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        showToast("This email is already registered. Please log in instead.", "error");
        setLoading(false);
        return;
      }

      if (res.status < 200 || res.status >= 300) {
        showToast(data.message || "Registration failed. Please try again.", "error");
        setLoading(false);
        return;
      }

      // 2. Sign in to get token
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      // 3. Store token in localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("userId", userCredential.user.uid);

      showToast("Account created successfully! Redirecting...", "success");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err: unknown) {
      console.error("Registration error:", err);

      if (err instanceof Error && "code" in err) {
        const firebaseErr = err as { code?: string };
        switch (firebaseErr.code) {
          case "auth/email-already-in-use":
            showToast("This email is already in use.", "error");
            break;
          case "auth/invalid-email":
            showToast("Invalid email address.", "error");
            break;
          case "auth/weak-password":
            showToast("Password is too weak. Use at least 6 characters.", "error");
            break;
          case "auth/network-request-failed":
            showToast("Network error. Please check your connection.", "error");
            break;
          default:
            showToast(
              err instanceof Error ? err.message : "Something went wrong. Please try again.",
              "error"
            );
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
      <form className="flex flex-col">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <label htmlFor="firstName">First Name</label>
        <input
          type="text"
          id="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          disabled={loading}
        />

        <label htmlFor="middleName">Middle Name</label>
        <input
          type="text"
          id="middleName"
          value={middleName}
          onChange={(e) => setMiddleName(e.target.value)}
          disabled={loading}
        />

        <label htmlFor="lastName">Last Name</label>
        <input
          type="text"
          id="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          disabled={loading}
        />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
        />

        <button
          type="button"
          className="w-full rounded-md bg-blue-500 py-2 px-4 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-4 disabled:opacity-50"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </>
  );
};

export default SignUpForm;