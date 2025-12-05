// src/services/datasetService.ts
import { datasetHttp } from "../lib/https";

export interface DatasetDto {
  id: string;          // mapeamos el _id del backend
  name: string;
  description?: string | null;
  row_count?: number;
  uploaded_at?: string;
  columns?: string[];
  // cualquier otro campo que te interese...
}

export interface DatasetPreviewDto {
  columns: string[];
  rows: Record<string, any>[]; // 50 filas aprox.
}

// Si tu backend devuelve "_id" en vez de "id", en el front solemos normalizarlo
export function normalizeDataset(api: any): DatasetDto {
  return {
    id: api.id ?? api._id, // por si usa _id de Mongo
    name: api.name,
    description: api.description,
    row_count: api.row_count,
    uploaded_at: api.uploaded_at,
    columns: api.columns,
  };
}

export const datasetService = {
  // GET /datasets/
  list: () => datasetHttp.get("/datasets"),

  // GET /datasets/{dataset_id}
  get: (datasetId: string) => datasetHttp.get(`/datasets/${datasetId}`),

  // GET /datasets/{dataset_id}/preview
  // si en el backend soportas ?limit=50, dejamos el parámetro preparado
  preview: (datasetId: string, limit = 50) =>
    datasetHttp.get(`/datasets/${datasetId}/preview`, {
      params: { limit },
    }),

  // POST /datasets/upload
  upload: (formData: FormData) =>
    datasetHttp.post("/datasets/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // DELETE /datasets/{dataset_id}
  delete: (datasetId: string) =>
    datasetHttp.delete(`/datasets/${datasetId}`),

  // PATCH /datasets/{dataset_id} (por si luego quieres editar descripción, tags, etc.)
  update: (datasetId: string, data: any) =>
    datasetHttp.patch(`/datasets/${datasetId}`, data),
};