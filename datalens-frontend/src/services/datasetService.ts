import { datasetHttp } from "../lib/https";

export const datasetService = {
  upload: (formData: FormData) =>
    datasetHttp.post("/datasets/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  list: () => datasetHttp.get("/datasets"),

  getById: (dataset_id: string) =>
    datasetHttp.get(`/datasets/${dataset_id}`),
};