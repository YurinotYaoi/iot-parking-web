
import LoginForm from "../components/LoginForm";
import { useEffect, useState } from "react"; 

export default function LoginScreen() {
    useEffect(() => {
    document.title = "Login";
  }, []);

  return (
    <main className="flex flex-col w-full items-center justify-center py-32 px-16">
      <div className="p-5 rounded-2xl
      flex flex-col items-center justify-center">
        <h1 className="text-3xl font-semibold
        text-black dark:text-zinc-50">
          Login Page
        </h1>
        <p className="py-4">
          Dont have an account? <a href="/auth/signup"><u>Signup</u></a>
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
