import React from "react";
import Link from "next/link";
import { ParkingSign } from "./svg";

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full bg-gray-800 dark:bg-gray-900 py-5 px-24 border-b border-gray-700">
      <ul className="flex items-center justify-between">
        <li className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-white">
            FlexPark
          </Link>
        </li>
        <li className="flex items-center">
          <Link href="/" className="text-xl font-bold text-white">
            <ParkingSign></ParkingSign>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;