import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex min-h-screen w-full max-w-6xl flex-col items-center justify-between py-32 px-16 dark:bg-black sm:items-start">
        <div>
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Welcome to your{" "}
            <span className="text-red-700">IoT</span> frontend
          </h1>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Laborum, incidunt accusantium commodi harum perferendis totam iure iusto explicabo officiis nesciunt sequi animi similique illum dolorum quod esse atque quibusdam quaerat.
          </p>
          <div className="mt-4">
            <Link
              href="/auth/login"
              className="inline-block rounded-lg px-4 py-2 font-medium dark:text-black dark:bg-white bg-gray-800 text-white mr-4
              hover:bg-gray-500 hover:text-white
              transition duration-300 ease-in-out">
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="inline-block rounded-lg px-4 py-2 font-medium dark:text-black dark:bg-white bg-gray-800 text-white
              hover:bg-gray-500 hover:text-white
              transition duration-300 ease-in-out">
              Signup
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
