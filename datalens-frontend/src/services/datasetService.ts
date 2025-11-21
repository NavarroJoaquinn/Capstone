import { datasetHttp } from "../lib/https";

export const datasetService = {
  upload: (formData: FormData) =>
    datasetHttp.post("/datasets/upload", formData),

  list: () => datasetHttp.get("/datasets"),

  getById: (id: string) => datasetHttp.get(`/datasets/${id}`),

  // Alias
  get: (dataset_id: string) =>
    datasetHttp.get(`/datasets/${dataset_id}`),

  preview: (dataset_id: string) =>
    datasetHttp.get(`/datasets/${dataset_id}/preview`),

  
};