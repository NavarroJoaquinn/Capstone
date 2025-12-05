"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { datasetService } from "@/services/datasetService";
import { useToast } from "@/components/ToastProvider";

interface Dataset {
  id: string;
  name: string;
  description?: string | null;
  row_count?: number;
  uploaded_at?: string;
  columns?: string[];
}

interface PreviewData {
  columns: string[];
  rows: Record<string, any>[];
}

export default function DatasetDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPreview, setLoadingPreview] = useState(true);

  // 👇 NUEVO: handler para eliminar dataset
  const handleDelete = async () => {
    if (!dataset) return;

    const confirmDelete = window.confirm(
      `¿Seguro que quieres eliminar el dataset "${dataset.name}"? Esta acción no se puede deshacer.`
    );
    if (!confirmDelete) return;

    try {
      await datasetService.delete(dataset.id);
      toast.show("Dataset eliminado correctamente.", "success");
      router.push("/datasets");
    } catch (err) {
      console.error("Error eliminando dataset:", err);
      toast.show("No se pudo eliminar el dataset.", "error");
    }
  };

  // Cargar metadatos + preview
  useEffect(() => {
    if (!id) return;

    async function load() {
      try {
        setLoading(true);

        // 1) Dataset
        const res = await datasetService.get(id as string);
        const api = res.data;
        const normalized: Dataset = {
          id: api.id ?? api._id,
          name: api.name,
          description: api.description,
          row_count: api.row_count,
          uploaded_at: api.uploaded_at,
          columns: api.columns,
        };
        setDataset(normalized);
      } catch (err) {
        console.error(err);
        toast.show("No se pudo cargar la información del dataset.", "error");
      } finally {
        setLoading(false);
      }

      try {
        setLoadingPreview(true);
        const prevRes = await datasetService.preview(id as string);
        const data = prevRes.data;

        // Estructura REAL del backend:
        // { columns: [...], preview: [...] }
        const columns: string[] = data.columns ?? [];
        const rows: Record<string, any>[] = data.preview ?? [];
        setPreview({ columns, rows });
      } catch (err) {
        console.error(err);
        toast.show("No se pudo cargar la vista previa del dataset.", "error");
      } finally {
        setLoadingPreview(false);
      }
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading && !dataset) {
    return (
      <div className="text-white p-8">
        <p>Cargando dataset...</p>
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="text-white p-8">
        <h2 className="text-2xl font-bold mb-4">Dataset no encontrado</h2>
        <button
          onClick={() => router.push("/datasets")}
          className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg"
        >
          ← Volver a mis datasets
        </button>
      </div>
    );
  }

  const uploadedStr = dataset.uploaded_at
    ? new Date(dataset.uploaded_at).toLocaleString()
    : null;

  return (
    <div className="max-w-6xl mx-auto text-white">
      {/* Header */}
      <button
        onClick={() => router.push("/datasets")}
        className="text-sm text-blue-300 hover:underline mb-4 inline-flex items-center gap-1"
      >
        ← Volver a la lista
      </button>

      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">📊</span>
        <h1 className="text-3xl font-bold">{dataset.name}</h1>
      </div>

      <p className="text-gray-400 mb-4">
        {dataset.description || "Sin descripción"}
      </p>

      <div className="flex flex-wrap gap-6 mb-8 text-sm text-gray-300">
        {uploadedStr && (
          <span>
            ⏱ <strong>Subido:</strong> {uploadedStr}
          </span>
        )}
        {typeof dataset.row_count === "number" && (
          <span>
            📄 <strong>Filas:</strong> {dataset.row_count}
          </span>
        )}
        {dataset.columns && (
          <span>
            🔢 <strong>Columnas:</strong> {dataset.columns.length}
          </span>
        )}
      </div>

      {/* 👇 AQUÍ: botón de analizar + botón de eliminar, en la misma fila */}
      <div className="mb-8 flex gap-4">
        <button
          onClick={() =>
            // si más adelante quieres que llegue preseleccionado,
            // puedes agregar query param ?dataset_id=...
            router.push("/analytics")
          }
          className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-lg font-medium"
        >
          Analizar este Dataset
        </button>

        <button
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-500 px-5 py-2 rounded-lg font-medium"
        >
          Eliminar dataset
        </button>
      </div>

      {/* Chips de columnas */}
      {dataset.columns && dataset.columns.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Columnas</h2>
          <div className="flex flex-wrap gap-2">
            {dataset.columns.map((col) => (
              <span
                key={col}
                className="px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-sm"
              >
                {col}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Preview */}
      <section className="mt-6">
        <h2 className="text-xl font-semibold mb-3">
          Preview ({preview?.rows?.length ?? 0} filas)
        </h2>

        {loadingPreview && (
          <p className="text-gray-400">Cargando preview...</p>
        )}

        {!loadingPreview && (!preview || preview.rows.length === 0) && (
          <p className="text-gray-400">
            No se pudo obtener una vista previa del dataset.
          </p>
        )}

        {!loadingPreview && preview && preview.rows.length > 0 && (
          <div className="overflow-auto border border-zinc-800 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-900">
                <tr>
                  {preview.columns.map((col) => (
                    <th
                      key={col}
                      className="px-3 py-2 text-left font-semibold border-b border-zinc-800"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-zinc-950" : "bg-zinc-900"}
                  >
                    {preview.columns.map((col) => (
                      <td
                        key={col}
                        className="px-3 py-1 border-b border-zinc-900 whitespace-nowrap"
                      >
                        {row[col] !== null && row[col] !== undefined
                          ? String(row[col])
                          : ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}