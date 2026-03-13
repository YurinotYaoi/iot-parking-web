"use client";

import { useState } from "react";

const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form className="flex flex-col gap-4">
      <label htmlFor="email" className="text-sm font-medium text-gray-700">
        Email
      </label>
      <input
        type="email"
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="block w-full rounded-md border-gray-300 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
      />

      <label htmlFor="password" className="text-sm font-medium text-gray-700">
        Password
      </label>
      <input
        type="password"
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="block w-full rounded-md border-gray-300 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
      />

      <button
        type="submit"
        className="w-full rounded-md bg-blue-500 py-2 px-4 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Sign Up
      </button>
    </form>
  );
};

export default SignUpForm;