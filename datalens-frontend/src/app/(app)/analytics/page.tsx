"use client";

import { useEffect, useState } from "react";
import { datasetService } from "@/services/datasetService";
import { analyticsService } from "@/services/analyticsService";

export default function AnalyticsPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const [confirmedDataset, setConfirmedDataset] = useState<string | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await datasetService.list();
      setDatasets(res.data);
    }
    load();
  }, []);

  const confirmDataset = async () => {
    if (!selectedDataset) return;
    setLoading(true);

    const res = await analyticsService.basic(selectedDataset);
    setColumns(res.data.columns);
    setConfirmedDataset(selectedDataset);

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center mt-20 text-white">
      <h1 className="text-4xl font-bold mb-12">Analíticas del Dataset</h1>

      {/* --- SELECTOR DE DATASET --- */}
      {!confirmedDataset && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg w-[500px] shadow-lg">
          <label className="text-sm text-gray-300">Seleccionar Dataset</label>

          <select
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 mt-2"
            value={selectedDataset}
            onChange={(e) => setSelectedDataset(e.target.value)}
          >
            <option value="">-- Seleccionar --</option>

            {datasets.map((ds) => (
              <option key={ds._id} value={ds._id}>
                {ds.filename || "Dataset sin nombre"}
              </option>
            ))}
          </select>

          <button
            onClick={confirmDataset}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-500 p-2 rounded"
          >
            Confirmar Dataset
          </button>
        </div>
      )}

      {/* --- SI EL DATASET FUE CONFIRMADO --- */}
      {confirmedDataset && (
        <>
          <h2 className="text-2xl mt-10 mb-4">
            Dataset seleccionado: <span className="text-blue-400">{confirmedDataset}</span>
          </h2>

          {/* Acciones */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <button
              onClick={async () => {
                const r = await analyticsService.basic(confirmedDataset);
                setResult(r.data);
              }}
              className="bg-blue-600 hover:bg-blue-500 p-4 rounded"
            >
              Análisis Básico
            </button>

            <button
              onClick={async () => {
                const col = columns[0];
                if (!col) return;
                const r = await analyticsService.valueCounts(confirmedDataset, col);
                setResult(r.data);
              }}
              className="bg-purple-600 hover:bg-purple-500 p-4 rounded"
            >
              Frecuencias
            </button>

            <button
              onClick={async () => {
                const r = await analyticsService.correlation(confirmedDataset);
                setResult(r.data);
              }}
              className="bg-teal-600 hover:bg-teal-500 p-4 rounded"
            >
              Correlación
            </button>
          </div>

          {/* Resultado */}
          {result && (
            <pre className="bg-zinc-900 mt-10 p-6 rounded-lg border border-zinc-800 w-[70%] whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </>
      )}
    </div>
  );
}