"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useRouter();

  const handleNavigation = () => {
    router.push('/dashboard');
  };

  return (
    <form className="flex flex-col">
      <label htmlFor="email" className="text-sm font-medium text-gray-700">
        Email
      </label>
      <input
        type="email"
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="block w-full rounded-md border-2 border-gray-500 p-2 text-sm text-gray-900 focus:border-gray-600"
      />

      <label htmlFor="name" className="text-sm font-medium text-gray-700">
        Name
      </label>
      <input
        type="name"
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="block w-full rounded-md border-2 border-gray-500 p-2 text-sm text-gray-900 focus:border-gray-600"
      />
      <label htmlFor="password" className="text-sm font-medium text-gray-700">
        Password
      </label>
      <input
        type="password"
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="block w-full rounded-md border-2 border-gray-500 p-2 text-sm text-gray-900 focus:border-gray-600"
      />

      <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
        Confirm Password
      </label>
      <input
        type="confirmPassword"
        id="confirmPassword"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="block w-full rounded-md border-2 border-gray-500 p-2 text-sm text-gray-900 focus:border-gray-600"
      />

      <button
        type="button"
        className="w-full rounded-md bg-blue-500 py-2 px-4 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-4" 
        onClick={handleNavigation}
      >
        Sign Up
      </button>
    </form>
  );
};

export default SignUpForm;