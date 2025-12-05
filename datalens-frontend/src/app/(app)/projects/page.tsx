"use client";

import { useEffect, useState } from "react";
import { projectService } from "@/services/projectService";
import Link from "next/link";

export default function ProjectHome() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await projectService.list();
        setProjects(res.data);
      } catch (err) {
        console.error("Error cargando proyectos:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Contenedor centrado */}
      <div className="max-w-5xl mx-auto pt-16 pb-24 px-4">
        {/* Cabecera */}
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-2">Tus Proyectos</h1>
          <p className="text-gray-400 text-sm">
            Gestiona tus proyectos y los datasets asociados.
          </p>
        </header>

        {/* Estados de carga / vacío / lista */}
        {loading && (
          <p className="text-gray-400 text-center">Cargando proyectos...</p>
        )}

        {!loading && projects.length === 0 && (
          <div className="text-center text-gray-400 border border-dashed border-zinc-700 rounded-xl py-16">
            <p className="mb-4">Aún no tienes proyectos creados.</p>
        
          </div>
        )}

        {!loading && projects.length > 0 && (
          <div className="space-y-4">
            {projects.map((p) => (
              <Link
                // si tu backend usa _id en vez de id, cámbialo por p._id
                key={p.id}
                href={`/projects/${p.id}`}
                className="block rounded-xl bg-zinc-900 border border-zinc-800 hover:border-blue-500 hover:bg-zinc-900/80 transition-colors p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">{p.name}</h2>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                      {p.description || "Sin descripción"}
                    </p>
                  </div>

                  {/* Badge opcional: nº de datasets si lo tienes en p.dataset_ids */}
                  {Array.isArray(p.dataset_ids) && (
                    <div className="shrink-0 text-right">
                      <span className="inline-flex items-center rounded-full bg-zinc-800 px-3 py-1 text-xs text-gray-300">
                        {p.dataset_ids.length} datasets
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Botón crear proyecto centrado */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/projects/new"
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium"
          >
            Crear Proyecto →
          </Link>
        </div>
      </div>
    </main>
  );
}