import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div>
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Welcome to your{" "}
            <span className="text-zinc-300">IoT</span> frontend
          </h1>
          <div>
            <Link
              href="/auth/login"
              className="inline-block rounded-lg px-4 py-2 font-medium text-black bg-white mr-1
              hover:bg-gray-500 hover:text-white
              transition duration-300 ease-in-out"
            >
              Login
            </Link>
            <Link
              href="/auth/login"
              className="inline-block rounded-lg px-4 py-2 font-medium text-black bg-white
              hover:bg-gray-500 hover:text-white
              transition duration-300 ease-in-out"
            >
              Register
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
