import { projectHttp } from "../lib/https";

export const projectService = {
  list: () => projectHttp.get("/projects"),

  create: (data: {
    name: string;
    description?: string;
    dataset_ids?: string[];
  }) => projectHttp.post("/projects", data),

  getById: (project_id: string) =>
    projectHttp.get(`/projects/${project_id}`),

  // PATCH parcial: puedes mandar solo lo que quieras actualizar
  update: (
    project_id: string,
    data: {
      name?: string;
      description?: string;
      user_email?: string;
      dataset_ids?: string[];
    }
  ) => projectHttp.patch(`/projects/${project_id}`, data),

  delete: (project_id: string) =>
    projectHttp.delete(`/projects/${project_id}`),

  addDataset: (project_id: string, dataset_id: string) =>
    projectHttp.post(`/projects/${project_id}/add_dataset`, {
      dataset_id,
    }),
};