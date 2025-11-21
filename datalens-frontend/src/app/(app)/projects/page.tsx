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
    <div className="text-white p-10">
      <h1 className="text-3xl font-bold mb-6">Tus Proyectos</h1>

      {loading && <p>Cargando proyectos...</p>}

      {!loading && projects.length === 0 && (
        <p className="text-gray-400">No tienes proyectos aún.</p>
      )}

      <div className="space-y-4 mt-6">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/projects/${p.id}`}
            className="block bg-zinc-800 hover:bg-zinc-700 p-4 rounded-lg border border-zinc-700"
          >
            <h2 className="text-xl font-semibold">{p.name}</h2>
            <p className="text-gray-400">{p.description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <Link
          href="/projects/new"
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
        >
          Crear Proyecto →
        </Link>
      </div>
    </div>
  );
}