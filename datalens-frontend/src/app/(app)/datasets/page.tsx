"use client";

import { useEffect, useState } from "react";
import { datasetService } from "@/services/datasetService";
import { useRouter } from "next/navigation";

interface Dataset {
  id?: string;      // por si el backend manda "id"
  _id?: string;     // o "_id" (Mongo)
  name: string;
  description?: string | null;
  row_count?: number;
  columns?: string[];
  uploaded_at: string;
}

export default function DatasetsPage() {
  const router = useRouter();

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // 1. LISTAR DATASETS
  // -----------------------------
  const fetchDatasets = async () => {
    try {
      const res = await datasetService.list();
      setDatasets(res.data || []);
    } catch (err) {
      console.error("Error listando datasets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  // ============================================================
  //                      RENDER
  // ============================================================
  if (loading) {
    return (
      <div className="p-10 text-white">
        <p className="text-zinc-400">Cargando datasets...</p>
      </div>
    );
  }

  return (
    <div className="p-10 text-white">
      <h2 className="text-xl font-semibold text-center mb-4">
        📁 Mis Datasets
      </h2>

      {datasets.length === 0 && (
        <p className="text-xl font-semibold text-center mb-4">No tienes datasets todavía.</p>
      )}

      {datasets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {datasets.map((d) => {
            const dsId = d.id ?? d._id; // usamos lo que venga
            return (
              <div
                key={dsId}
                className="p-4 bg-zinc-900 border border-zinc-700 rounded cursor-pointer hover:bg-zinc-800 transition"
                onClick={() => dsId && router.push(`/datasets/${dsId}`)}
              >
                <h2 className="text-xl font-semibold">{d.name}</h2>

                <p className="text-sm text-zinc-400 mt-1">
                  {d.description ?? "Sin descripción"}
                </p>

                <p className="text-sm text-zinc-500 mt-2">
                  Filas: {d.row_count ?? "-"}
                </p>

                <p className="text-sm text-zinc-500">
                  Subido: {d.uploaded_at
                    ? new Date(d.uploaded_at).toLocaleString()
                    : "-"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}