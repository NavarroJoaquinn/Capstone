// src/mocks/handlers.ts
import { http, HttpResponse } from "msw";
import { ANALYT } from "../api/client";

export const handlers = [
  http.get(`${ANALYT}/analytics/:id/summary`, () =>
    HttpResponse.json({
      shape: { rows: 4, cols: 3 },
      dtypes: { Region: "object", Monto: "int64", Canal: "object" },
      nulls: { Region: 0, Monto: 0, Canal: 0 },
      stats: { Monto: { count: 4, mean: 862.5, min: 500, max: 1200 } },
      top_categories: { Region: { Norte: 2, Sur: 1, Centro: 1 }, Canal: { Online: 2, Offline: 2 } },
    })
  ),
];