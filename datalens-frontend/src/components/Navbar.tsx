"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { authService } from "@/services/authService";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [openMenu, setOpenMenu] = useState(false);
  const [user, setUser] = useState<string | null>(null);

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // 🆕 Traer info del usuario al cargar
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    authService.me()
      .then(res => {
        // Puedes usar res.data.email o res.data.name si lo agregas en el futuro
        setUser(res.data.email);
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  const navItems = [
    { name: "Proyectos", href: "/projects" },
    { name: "Analíticas", href: "/projects/analytics" },
  ];

  return (
    <nav className="bg-[#003b2e] text-white px-8 py-4 flex items-center justify-between shadow-lg">

      <Link href="/" className="text-xl font-bold">
        DataLens
      </Link>

      {/* Navegación */}
      <div className="flex items-center gap-8 text-lg font-medium">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`hover:opacity-80 ${
              pathname.startsWith(item.href)
                ? "underline underline-offset-4"
                : ""
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>

      {/* Perfil */}
      <div className="relative">
        <button
          className="flex items-center gap-2 bg-[#004c3b] text-white px-3 py-1 rounded hover:bg-[#046b52] transition"
          onClick={() => setOpenMenu(!openMenu)}
        >
          <img
            src={`https://ui-avatars.com/api/?name=${user || "?"}&background=003b2e&color=fff`}
            className="w-7 h-7 rounded-full"
          />
          {user || "Usuario"}
          <FaChevronDown
            className={`transition-transform ${openMenu ? "rotate-180" : ""}`}
          />
        </button>

        {openMenu && (
          <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow-md text-blue-900 overflow-hidden z-50">
            <button
              onClick={() => router.push("/profile")}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
            >
              Perfil
            </button>

            <button
              onClick={() => router.push("/settings")}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
            >
              Configuración
            </button>

            <button
              onClick={logout}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}