"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CurrentUser {
  email: string;
  name?: string;
}

// Helper para iniciales del avatar
function getInitials(text: string) {
  if (!text) return "?";
  const cleaned = text.trim();
  if (cleaned.includes(" ")) {
    const parts = cleaned.split(" ").filter(Boolean);
    return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  // Si es correo, usamos la primera letra del antes del @
  const beforeAt = cleaned.split("@")[0];
  return (beforeAt[0] ?? "?").toUpperCase();
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Cargar usuario desde localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedUser = window.localStorage.getItem("datalens_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        return;
      }

      const email = window.localStorage.getItem("datalens_email");
      if (email) {
        setUser({ email });
      }
    } catch (e) {
      console.error("Error leyendo usuario desde localStorage", e);
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("datalens_user");
      window.localStorage.removeItem("datalens_email");
    }
    router.push("/login");
  };

  const displayName = user?.name || user?.email || "Usuario";

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  return (
    <nav className="w-full bg-emerald-950 text-white shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Marca: ahora botón que lleva al home */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-xl tracking-wide hover:text-emerald-200 transition">
            Datalens Analytics
          </span>
        </Link>

        {/* Links centro: un poco más grandes */}
        <div className="hidden md:flex items-center gap-8 text-base">
          <Link
            href="/projects"
            className={`hover:text-emerald-200 transition ${
              isActive("/projects")
                ? "border-b-2 border-emerald-300 pb-1"
                : ""
            }`}
          >
            Proyectos
          </Link>

          <Link
            href="/datasets"
            className={`hover:text-emerald-200 transition ${
              isActive("/datasets")
                ? "border-b-2 border-emerald-300 pb-1"
                : ""
            }`}
          >
            Datasets
          </Link>

          <Link
            href="/analytics"
            className={`hover:text-emerald-200 transition ${
              isActive("/analytics")
                ? "border-b-2 border-emerald-300 pb-1"
                : ""
            }`}
          >
            Analíticas
          </Link>
        </div>

        {/* Menú usuario */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 bg-emerald-900 hover:bg-emerald-800 px-3 py-1.5 rounded-full text-sm"
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-zinc-900 text-xs font-semibold">
              {getInitials(displayName)}
            </span>
            <span>{displayName}</span>
            <span className="text-xs">{menuOpen ? "▲" : "▼"}</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg text-sm z-50">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  router.push("/profile");
                }}
                className="w-full text-left px-4 py-2 hover:bg-zinc-800"
              >
                Perfil
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  router.push("/settings");
                }}
                className="w-full text-left px-4 py-2 hover:bg-zinc-800"
              >
                Configuración
              </button>
              <hr className="border-zinc-800" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-400 hover:bg-zinc-800"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}