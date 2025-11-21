"use client";

import { useState } from "react";
import { datasetService } from "@/services/datasetService";
import { useRouter } from "next/navigation";

export default function DatasetUploadPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!file) {
      setError("Por favor selecciona un archivo CSV.");
      return;
    }

    const form = new FormData();
    form.append("file", file);
    form.append("description", description);
    form.append("tags", tags);

    try {
      setLoading(true);

      await datasetService.upload(form);

      setSuccess("Dataset subido correctamente ✔");
      setTimeout(() => router.push("/datasets"), 1000);
    } catch (err: any) {
      console.error(err);
      setError("Error subiendo dataset. Asegúrate de que el archivo sea válido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center mt-16 px-4">
      <div className="bg-zinc-900 border border-zinc-700 p-10 rounded-xl w-full max-w-xl shadow-xl">

        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Subir Dataset
        </h1>

        {error && <p className="text-red-400 mb-4 text-center">{error}</p>}
        {success && <p className="text-green-400 mb-4 text-center">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Archivo CSV */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              Archivo CSV
            </label>
            <input
              type="file"
              accept=".csv"
              className="w-full file:bg-blue-600 file:hover:bg-blue-700 
                         file:border-none file:px-4 file:py-2 file:rounded 
                         file:text-white file:cursor-pointer
                         text-gray-200 bg-zinc-800 p-2 rounded border border-zinc-700"
              onChange={(e) => e.target.files && setFile(e.target.files[0])}
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              Descripción
            </label>
            <textarea
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-3 text-gray-200"
              rows={3}
              placeholder="Descripción del dataset..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              Tags (separados por coma)
            </label>
            <input
              type="text"
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-gray-200"
              placeholder="ventas, clientes, 2024"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg 
                       bg-green-600 hover:bg-green-700 
                       text-white font-semibold transition 
                       disabled:bg-green-900 disabled:cursor-not-allowed"
          >
            {loading ? "Subiendo..." : "Subir Dataset"}
          </button>

        </form>

        <button
          onClick={() => router.back()}
          className="mt-6 w-full py-2 rounded bg-zinc-700 hover:bg-zinc-600 text-gray-200"
        >
          ← Volver
        </button>
      </div>
    </div>
  );
}