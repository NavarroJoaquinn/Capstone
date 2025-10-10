import { DATA, api } from "./client";

export type Dataset = {
  _id?: string; id?: string; name: string; uploaded_at?: string;
};
export async function listDatasets(token: string): Promise<Dataset[]> {
  return api(`${DATA}/datasets`, {}, token);
}

export async function uploadDataset(file: File, name: string, token: string) {
  const form = new FormData();
  form.append("file", file);
  form.append("name", name);
  return api(`${DATA}/datasets/upload`, { method: "POST", body: form }, token);
}