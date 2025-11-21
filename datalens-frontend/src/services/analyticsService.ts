import { analyticsHttp } from "@/lib/https";

export const analyticsService = {
  // Tipos semánticos de columnas (numeric, categorical, text, etc.)
  semanticTypes: (datasetId: string) =>
    analyticsHttp.get(`/analytics/semantic_types/${datasetId}`),

  // Histograma de 1 columna numérica
  histogram: (datasetId: string, column: string) =>
    analyticsHttp.get(
      `/analytics/histogram/${datasetId}/${encodeURIComponent(column)}`
    ),

  // Pie chart de 1 columna categórica
   pie: (datasetId: string, column: string) =>
    analyticsHttp.get(`/analytics/pie/${datasetId}/${column}`),

  // Heatmap de correlación entre columnas numéricas
  heatmap: (datasetId: string) =>
    analyticsHttp.get(`/analytics/heatmap/${datasetId}`),
};