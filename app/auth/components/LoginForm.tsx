"use client";

import { link } from "fs";
import { useState } from "react";
import { useRouter } from "next/navigation";


const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
      <button
        type="submit"
        className="w-full rounded-md bg-blue-500 py-2 px-4 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-4">
        Login
      </button>

      <button type="button" className="mt-2 bg-green-800 rounded-3xl" onClick={handleNavigation}>
        Go To Dashboard Page
      </button>
    </form>
  );
};

//Delete the Dashboard Button before pushing to production, this is just for testing the navigation from login to dashboard page without authentication for now

export default LoginForm;