"use client";

import { useState } from "react";
import { projectService } from "@/services/projectService";
import { datasetService } from "@/services/datasetService";
import { useRouter } from "next/navigation";

export default function NewProjectPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar datasets para seleccionar
  useState(() => {
    datasetService
      .list()
      .then((r) => setDatasets(r.data))
      .catch((e) => console.error(e));
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("El nombre es obligatorio");

    setLoading(true);

    try {
      const res = await projectService.create({
        name,
        description,
        dataset_ids: selectedDatasets,
      });

      alert("Proyecto creado con éxito!");
      router.push(`/projects/${res.data.id}`);

    } catch (err: any) {
      console.error(err);
      alert("Error creando el proyecto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Crear Nuevo Proyecto</h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        <div>
          <label className="font-semibold">Nombre *</label>
          <input
            className="w-full mt-2 p-2 rounded bg-zinc-800 border border-zinc-700"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="font-semibold">Descripción (opcional)</label>
          <textarea
            className="w-full mt-2 p-2 rounded bg-zinc-800 border border-zinc-700"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="font-semibold">Datasets asociados</label>

          <select
            multiple
            className="w-full mt-2 p-2 rounded bg-zinc-800 border border-zinc-700"
            onChange={(e) =>
              setSelectedDatasets(
                Array.from(e.target.selectedOptions, (opt) => opt.value)
              )
            }
          >
            {datasets.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <button
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 p-2 rounded mt-4"
        >
          {loading ? "Creando..." : "Crear Proyecto"}
        </button>
      </form>
    </div>
  );
}