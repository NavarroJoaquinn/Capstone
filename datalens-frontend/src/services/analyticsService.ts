import { analyticsHttp } from "../lib/https";

export const analyticsService = {
  basic: (dataset_id: string) =>
    analyticsHttp.get(`/analytics/basic/${dataset_id}`),

  valueCounts: (dataset_id: string, column: string) =>
    analyticsHttp.get(`/analytics/value_counts/${dataset_id}/${column}`),

  correlation: (dataset_id: string) =>
    analyticsHttp.get(`/analytics/correlation/${dataset_id}`),

  columnStats: (dataset_id: string, column: string) =>
    analyticsHttp.get(`/analytics/column_stats/${dataset_id}/${column}`),

  outliers: (dataset_id: string, column: string) =>
    analyticsHttp.get(`/analytics/outliers/${dataset_id}/${column}`),

  semanticTypes: (dataset_id: string) =>
    analyticsHttp.get(`/analytics/semantic_types/${dataset_id}`),
};