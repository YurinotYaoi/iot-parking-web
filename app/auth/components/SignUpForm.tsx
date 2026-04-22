"use client";

import { useState, useEffect} from "react";
import { useRouter } from "next/navigation";


const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useRouter();

    useEffect(() => {
    document.title = "Sign Up | FlexPark";
  }, []);

  const handleRegister = async () => {
  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

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
      secretKey: process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY
    }),
  });

  const data = await res.json();

  if (res.status >= 200 && res.status < 300) {
    alert("Registration successful!");
    router.push("/dashboard");
  } else {
    alert(data.message || "Something went wrong");
  }
};

  return (
    <form className="flex flex-col">
      <label htmlFor="email" >
        Email
      </label>
      <input
        type="email"
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label htmlFor="firstName">
        FirstName
      </label>
      <input
        type="firstName"
        id="firstName"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />

      <label htmlFor="middleName">
        MiddleName
      </label>
      <input
        type="middleName"
        id="middleName"
        value={middleName}
        onChange={(e) => setMiddleName(e.target.value)}
      />

      <label htmlFor="lastName">
        LastName
      </label>
      <input
        type="lastName"
        id="lastName"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />

      <label htmlFor="password" className=" ">
        Password
      </label>
      <input
        type="password"
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <label htmlFor="confirmPassword">
        Confirm Password
      </label>
      <input
        type="confirmPassword"
        id="confirmPassword"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button
        type="button"
        className="w-full rounded-md bg-blue-500 py-2 px-4 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-4" 
        onClick={handleRegister}
      >
        Sign Up
      </button>
    </form>
  );
};

export default SignUpForm;