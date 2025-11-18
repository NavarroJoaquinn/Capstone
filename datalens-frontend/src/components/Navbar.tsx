"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <nav className="w-full bg-blue-600 text-white px-6 py-3 flex items-center justify-between shadow">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="text-lg font-semibold">
          DataLens
        </Link>

        <Link href="/dashboard" className="hover:opacity-80">
          Dashboard
        </Link>

        <Link href="/projects" className="hover:opacity-80">
          Proyectos
        </Link>

        <Link href="/projects/analytics" className="hover:opacity-80">
          Analíticas
        </Link>
      </div>

      <button
        onClick={logout}
        className="bg-white text-blue-600 px-4 py-1 rounded hover:bg-gray-200"
      >
        Logout
      </button>
    </nav>
  );
}