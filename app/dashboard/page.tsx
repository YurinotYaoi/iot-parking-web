import React from "react";

export default function DashboardScreen() {
  return (
    <main className="flex flex-col min-h-screen w-full items-center justify-center py-32 px-16
    bg-white dark:bg-black">
      <div className="border-2 border-gray-500 p-5 rounded-2xl
      flex flex-col items-center justify-center">
        <h1 className="text-3xl font-semibold
        text-black dark:text-zinc-50">
          Dashboard Page
        </h1>
      </div>
    </main>
  );
}