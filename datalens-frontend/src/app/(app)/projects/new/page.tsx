"use client";

import { useEffect, useState } from "react";
import { projectService } from "@/services/projectService";
import { datasetService } from "@/services/datasetService";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";


export default function NewProjectPage() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar datasets para seleccionar
  useEffect(() => {
    datasetService
      .list()
      .then((r) => setDatasets(r.data))
      .catch((e) => console.error("Error cargando datasets:", e));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.show("El nombre es obligatorio");
      return;
    }

    setLoading(true);

    try {
      const res = await projectService.create({
        name,
        description,
        dataset_ids: selectedDatasets,
      });

      toast.show("Proyecto creado con éxito");
      router.push(`/projects/${res.data.id}`);
    } catch (err) {
      console.error(err);
      toast.show("Error creando el proyecto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto pt-16 pb-24 px-4">
        {/* Título centrado */}
        <header className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Crear nuevo proyecto</h1>
          <p className="text-sm text-gray-400">
            Define el nombre, una breve descripción y los datasets que estarán
            asociados a este proyecto.
          </p>
        </header>

        {/* Card del formulario */}
        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 sm:p-8 space-y-8"
        >
          {/* Sección: información del proyecto */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Información del proyecto</h2>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Nombre *
              </label>
              <input
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Proyecto Demo Ventas 2025"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Descripción (opcional)
              </label>
              <textarea
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[90px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el objetivo del proyecto o las decisiones que quieres tomar."
              />
            </div>
          </section>

          {/* Sección: datasets asociados a tu cuenta */}
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">
                Datasets asociados a tu cuenta
              </h2>
              <span className="text-xs text-gray-400">
                {selectedDatasets.length > 0
                  ? `${selectedDatasets.length} seleccionado(s)`
                  : "Ningún dataset seleccionado"}
              </span>
            </div>

            <p className="text-sm text-gray-400">
              Elige uno o más datasets que quieras analizar dentro de este
              proyecto. Puedes mantener presionada la tecla Ctrl (o Cmd en Mac)
              para seleccionar varios.
            </p>

            <select
              multiple
              className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[140px]"
              onChange={(e) =>
                setSelectedDatasets(
                  Array.from(e.target.selectedOptions, (opt) => opt.value)
                )
              }
            >
              {datasets.map((d) => (
                <option key={d._id ?? d.id} value={d._id ?? d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </section>

          {/* Botón crear proyecto */}
          <button
            disabled={loading}
            className="w-full mt-4 inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 px-4 py-2 text-sm font-semibold"
          >
            {loading ? "Creando..." : "Crear proyecto"}
          </button>
        </form>
      </div>
    </main>
  );
}