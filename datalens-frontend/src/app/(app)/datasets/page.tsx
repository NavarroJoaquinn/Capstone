"use client";

import { useEffect, useState } from "react";
import { datasetService } from "@/services/datasetService";
import { useRouter } from "next/navigation";

interface Dataset {
  _id: string;
  name: string;
  description?: string;
  row_count?: number;
  columns?: string[];
  uploaded_at: string;
}

export default function DatasetsPage() {
  const router = useRouter();

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  // -----------------------------
  // 1. LISTAR DATASETS
  // -----------------------------
  const fetchDatasets = async () => {
    try {
      const res = await datasetService.list();
      setDatasets(res.data);
    } catch (err) {
      console.error("Error listando datasets:", err);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // 2. SELECCIONAR DATASET
  // -----------------------------
  const selectDataset = async (_id: string) => {
    if (!_id) return;

    setSelectedId(_id);
    setPreviewLoading(true);

    try {
      const [metaRes, previewRes] = await Promise.all([
        datasetService.getById(_id),
        datasetService.preview(_id),
      ]);

      setSelectedDataset(metaRes.data);
      setColumns(previewRes.data.columns ?? []);
      setPreview(previewRes.data.preview ?? []);
    } catch (err) {
      console.error("Error cargando dataset:", err);
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  // ============================================================
  //                  UI — LISTA DE DATASETS
  // ============================================================
  const renderDatasetList = () => (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold mb-6">📁 Mis Datasets</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {datasets.map((d) => (
          <div
            key={d._id}
            className="p-4 bg-zinc-900 border border-zinc-700 rounded cursor-pointer hover:bg-zinc-800 transition"
            onClick={() => selectDataset(d._id)}
          >
            <h2 className="text-xl font-semibold">{d.name}</h2>

            <p className="text-sm text-zinc-400 mt-1">
              {d.description ?? "Sin descripción"}
            </p>

            <p className="text-sm text-zinc-500 mt-2">
              Filas: {d.row_count ?? "-"}
            </p>

            <p className="text-sm text-zinc-500">
              Subido: {new Date(d.uploaded_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {datasets.length === 0 && (
        <p className="text-zinc-400 text-center mt-10">No tienes datasets todavía.</p>
      )}
    </div>
  );

  // ============================================================
  //              UI — MODO B (DATASET SELECCIONADO)
  // ============================================================
  const renderSelected = () => {
    if (!selectedDataset) return null;

    return (
      <div className="space-y-4">
        <button
          onClick={() => {
            setSelectedId(null);
            setSelectedDataset(null);
            setPreview([]);
            setColumns([]);
          }}
          className="text-blue-400 hover:text-blue-300 underline"
        >
          ← Volver a la lista
        </button>

        <h1 className="text-3xl font-bold mb-2">📊 {selectedDataset.name}</h1>

        <p className="text-zinc-400 mb-4">
          {selectedDataset.description ?? "Sin descripción"}
        </p>

        <div className="flex gap-4">
          <button
            onClick={() =>
              router.push(`/analytics?dataset=${selectedDataset._id}`)
            }
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
          >
            Analizar este Dataset
          </button>
        </div>

        <hr className="border-zinc-700 my-4" />

        <h2 className="text-xl font-semibold mb-2">Columnas ({columns.length})</h2>
        <div className="flex flex-wrap gap-2">
          {columns.map((col) => (
            <span
              key={col}
              className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm"
            >
              {col}
            </span>
          ))}
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Preview (50 filas)</h2>

        {previewLoading ? (
          <p className="text-zinc-400">Cargando preview...</p>
        ) : (
          <div className="overflow-auto max-h-[400px] border border-zinc-800 rounded">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="bg-zinc-900 p-2 border-b border-zinc-800 text-left"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="odd:bg-zinc-900 even:bg-zinc-800">
                    {columns.map((col) => (
                      <td key={col} className="p-2 border-b border-zinc-800">
                        {row[col] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // ============================================================
  //                      RENDER FINAL
  // ============================================================
  return (
    <div className="p-10 text-white">
      {loading ? (
        <p className="text-zinc-400">Cargando...</p>
      ) : selectedId ? (
        renderSelected()
      ) : (
        renderDatasetList()
      )}
    </div>
  );
}