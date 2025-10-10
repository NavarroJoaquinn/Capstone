import { useQuery } from "@tanstack/react-query";
import { api, ANALYT } from "../../api/client";

// 👉 Tipo mínimo para la respuesta de /summary
export type SummaryResponse = {
  shape: { rows: number; cols: number };
  dtypes: Record<string, string>;
  nulls: Record<string, number>;
  stats: Record<
    string,
    { count: number; mean?: number; min?: number; max?: number; std?: number }
  >;
  top_categories: Record<string, Record<string, number>>;
};

export function useSummary(datasetId: string, token: string) {
  return useQuery<SummaryResponse>({
    queryKey: ["summary", datasetId],
    queryFn: () => api(`${ANALYT}/analytics/${datasetId}/summary`, {}, token),
    enabled: !!datasetId && !!token,
  });
}