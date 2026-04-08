"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-black text-white px-6 py-4 flex justify-between items-center shadow">
      
      {/* Logo */}
      <h1 className="font-bold text-xl tracking-wide">
        League Manager
      </h1>

      {/* Links */}
      <div className="flex gap-6 text-sm font-medium">
        <Link href="/" className="hover:text-gray-300 transition">Home</Link>
        <Link href="/teams" className="hover:text-gray-300 transition">Teams</Link>
        <Link href="/fixtures" className="hover:text-gray-300 transition">Fixtures</Link>
      </div>
    </nav>
  );
}