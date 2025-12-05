import { analyticsHttp } from "@/lib/https";

export const analyticsService = {
  semanticTypes: (datasetId: string) =>
    analyticsHttp.get(`/analytics/semantic_types/${datasetId}`),

  histogram: (datasetId: string, column: string) =>
    analyticsHttp.get(
      `/analytics/histogram/${datasetId}/${encodeURIComponent(column)}`
    ),

  pie: (datasetId: string, column: string) =>
    analyticsHttp.get(
      `/analytics/pie/${datasetId}/${encodeURIComponent(column)}`
    ),


  updateAnalysis: (analysisId: string, data: any) =>
    analyticsHttp.patch(`/analytics/analyses/${analysisId}`, data),

  deleteAnalysis: (analysisId: string) =>
    analyticsHttp.delete(`/analytics/analyses/${analysisId}`),

  heatmap: (datasetId: string) =>
    analyticsHttp.get(`/analytics/heatmap/${datasetId}`),

  // 🔹 Nuevo: guardar análisis
  saveAnalysis: (payload: {
    project_id: string | null;
    dataset_id: string;
    type: string;
    columns: string[];
    name?: string;
    description?: string;
  }) => analyticsHttp.post("/analytics/analyses", payload),


  analysesByProject: (projectId: string) =>
    analyticsHttp.get(`/analytics/analyses/by_project/${projectId}`),

  // 🔹 Nuevo: listar análisis por proyecto (para futuros dashboards)
  getAnalysesByProject: (projectId: string) =>
    analyticsHttp.get(`/analytics/analyses/by_project/${projectId}`),

  columnStats(datasetId: string, column: string) {
    return analyticsHttp.get(
      `/analytics/column_stats/${datasetId}/${encodeURIComponent(column)}`
    );
  },

  valueCounts(datasetId: string, column: string) {
    return analyticsHttp.get(
      `/analytics/value_counts/${datasetId}/${encodeURIComponent(column)}`
    );
  },

};