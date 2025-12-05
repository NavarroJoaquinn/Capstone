"use client";

import { useEffect, useState } from "react";
import { authService } from "@/services/authService";

interface CurrentUser {
  email: string;
  name?: string;
  role?: string;
  created_at?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // 1) Intentar obtener desde backend
        try {
          const res = await authService.me();
          if (!cancelled && res?.data) {
            const api = res.data;
            setUser({
              email: api.email ?? "",
              name: api.name ?? api.full_name ?? undefined,
              role: api.role ?? api.user_role ?? undefined,
              created_at: api.created_at ?? api.registered_at ?? undefined,
            });
            return;
          }
        } catch {
          // 2) Si falla, usamos localStorage como respaldo
          if (typeof window !== "undefined" && !cancelled) {
            const storedUser = window.localStorage.getItem("datalens_user");
            if (storedUser) {
              setUser(JSON.parse(storedUser));
              return;
            }
            const email = window.localStorage.getItem("datalens_email");
            if (email) {
              setUser({ email });
              return;
            }
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8">
          Perfil
        </h1>

        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold mb-4">
            Información básica
          </h2>

          {loading ? (
            <p className="text-gray-400 text-sm">
              Cargando información del usuario...
            </p>
          ) : !user ? (
            <p className="text-gray-400 text-sm">
              No se encontró información del usuario en esta sesión.
            </p>
          ) : (
            <div className="space-y-3 text-sm sm:text-base">
              <div>
                <span className="font-semibold">Nombre:</span>{" "}
                <span>{user.name ?? "No especificado"}</span>
              </div>
              <div>
                <span className="font-semibold">Correo electrónico:</span>{" "}
                <span>{user.email}</span>
              </div>
              {user.role && (
                <div>
                  <span className="font-semibold">Rol:</span>{" "}
                  <span>{user.role}</span>
                </div>
              )}
              {user.created_at && (
                <div>
                  <span className="font-semibold">
                    Cuenta creada:
                  </span>{" "}
                  <span>
                    {new Date(user.created_at).toLocaleString()}
                  </span>
                </div>
              )}

              <p className="text-xs text-gray-500 pt-2">
                Esta información se obtiene de tu sesión actual en DataLens
                Analytics. Más adelante podrás editar tu nombre público y otros
                datos del perfil.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}