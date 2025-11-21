"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { projectService } from "@/services/projectService";
import { datasetService } from "@/services/datasetService";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [project, setProject] = useState<any>(null);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await projectService.getById(id as string);
        const proj = res.data;
        setProject(proj);

        // Cargar datasets asociados (IDs reales)
        if (proj.dataset_ids.length > 0) {
          const datasetDetails = await Promise.all(
            proj.dataset_ids.map((dsId: string) => datasetService.get(dsId).catch(() => null))
          );

          setDatasets(datasetDetails.filter((d: any) => d !== null).map((d: any) => d.data));
        }
      } catch (err) {
        console.error(err);
        alert("No se pudo cargar el proyecto");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return <p className="text-white p-10">Cargando proyecto...</p>;
  }

  if (!project) {
    return (
      <div className="text-red-400 p-10">
        <h2 className="text-2xl font-bold">Proyecto no encontrado</h2>
        <button
          onClick={() => router.push("/projects")}
          className="mt-4 bg-zinc-800 px-4 py-2 rounded"
        >
          ← Volver
        </button>
      </div>
    );
  }

  return (
    <div className="p-10 text-white max-w-4xl">
      {/* ----------- TÍTULO ----------- */}
      <h1 className="text-4xl font-bold mb-2">{project.name}</h1>
      <p className="text-gray-400 mb-6">{project.description || "Sin descripción"}</p>

      {/* ----------- METADATOS ----------- */}
      <div className="bg-zinc-900 p-5 rounded-lg mb-8 border border-zinc-700">
        <p>📅 <strong>Creado:</strong> {new Date(project.created_at).toLocaleString()}</p>
        <p>🕒 <strong>Modificado:</strong> {new Date(project.updated_at).toLocaleString()}</p>
        <p>📂 <strong>Datasets asociados:</strong> {project.dataset_ids.length}</p>
      </div>

      {/* ----------- ACCIONES ----------- */}
      <div className="flex gap-3 mb-10">
        <button
          onClick={() => alert("Pronto podrás editar proyectos")}
          className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg"
        >
          ✏️ Editar Proyecto
        </button>

        <button
          onClick={() => alert("Pronto podrás agregar datasets")}
          className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg"
        >
          ➕ Agregar Dataset
        </button>

        <button
          onClick={async () => {
            if (confirm("¿Seguro que deseas eliminar este proyecto?")) {
              await projectService.delete(project.id);
              router.push("/projects");
            }
          }}
          className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg"
        >
          🗑️ Eliminar
        </button>
      </div>

      {/* ----------- LISTA DE DATASETS ----------- */}
      <h2 className="text-2xl font-semibold mb-4">Datasets asociados</h2>

      {datasets.length === 0 ? (
        <p className="text-gray-500">Este proyecto aún no tiene datasets asociados.</p>
      ) : (
        <div className="space-y-4">
          {datasets.map((ds) => (
            <div
              key={ds.id}
              className="bg-zinc-900 border border-zinc-700 p-4 rounded-lg flex justify-between"
            >
              <div>
                <h3 className="text-xl font-semibold">{ds.name}</h3>
                <p className="text-gray-400">Columnas: {ds.columns.length}</p>
              </div>

              <button
                onClick={() => router.push(`/datasets/${ds.id}`)}
                className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg"
              >
                Ver →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ----------- BOTÓN VOLVER ----------- */}
      <button
        onClick={() => router.push("/projects")}
        className="mt-10 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg"
      >
        ← Volver
      </button>
    </div>
  );
}