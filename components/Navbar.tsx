"use client";

import Image from "next/image";
import ThemeToggle from "@/components/ui/theme-toggle";
import { useRouter } from "next/navigation";

const Navbar = () => {

  const router = useRouter();

  const handleHomeClick = () => {
    router.push("/");
  };

  return (
    <nav className="w-full border-b border-gray-700 bg-gray-900 px-6 py-4 sm:px-12 lg:px-24">
      <ul className="flex items-center justify-between">
        <li className="flex items-center">
          <button onClick={null} className="group inline-flex items-center gap-3 text-2xl font-bold text-white transition hover:text-gray-300">
            <Image
              src="/adpark-logo.png"
              alt="ADPark logo"
              width={50}
              height={50}
              priority
            />
            <span>ADPARK</span>
          </button>
        </li>
        <li className="flex items-center">
          <ThemeToggle />
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;