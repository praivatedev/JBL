"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-black text-white p-4 flex justify-between">
      <h1 className="font-bold text-lg">League Manager</h1>

      <div className="flex gap-6">
        <Link href="/">Home</Link>
        <Link href="/teams">Teams</Link>
        <Link href="/teams/create">Add Team</Link>
      </div>
    </nav>
  );
}