"use client";

import Image from "next/image";
import ThemeToggle from "@/components/ui/theme-toggle";

const Navbar = () => {
  return (
    <nav className="w-full border-b border-gray-700 bg-gray-900 px-6 py-4 sm:px-12 lg:px-24">
      <ul className="flex items-center justify-between">
        <li className="flex items-center">
          <div className="inline-flex items-center gap-3 text-2xl font-bold text-white">
            <Image
              src="/adpark-logo.png"
              alt="ADPark logo"
              width={50}
              height={50}
              priority
            />
            <span>ADPARK</span>
          </div>
        </li>
        <li className="flex items-center">
          <ThemeToggle />
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;