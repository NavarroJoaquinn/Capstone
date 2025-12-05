"use client";

import dynamic from "next/dynamic";

// Import dinámico para evitar problemas de SSR con Plotly
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface PlotPayload {
  data: any[];
  layout?: any;
  config?: any;
}

interface Props {
  type: "histogram" | "piechart" | "heatmap" | null;
  data: PlotPayload | null;
}

export default function PlotView({ type, data }: Props) {
  const hasDataArray =
    data && Array.isArray(data.data) && data.data.length > 0;

  // Si no hay trazas para plotear, mostramos un aviso en vez de dejar el área vacía
  if (!hasDataArray) {
    return (
      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700 mt-10">
        {type && (
          <h2 className="text-xl font-semibold mb-4">
            Visualización:{" "}
            <span className="text-blue-400">
              {type === "histogram" && "Histograma"}
              {type === "piechart" && "Gráfico de Torta"}
              {type === "heatmap" && "Heatmap de Correlación"}
            </span>
          </h2>
        )}

        <p className="text-gray-300">
          No hay datos suficientes para generar esta visualización. Verifica las
          columnas seleccionadas o prueba con otro tipo de gráfico.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700 mt-10">
      {type && (
        <h2 className="text-xl font-semibold mb-4">
          Visualización:{" "}
          <span className="text-blue-400">
            {type === "histogram" && "Histograma"}
            {type === "piechart" && "Gráfico de Torta"}
            {type === "heatmap" && "Heatmap de Correlación"}
          </span>
        </h2>
      )}

      <div className="w-full h-[480px]">
        <Plot
          data={data.data}
          layout={{
            autosize: true,
            margin: { l: 40, r: 20, t: 40, b: 40 },
            paper_bgcolor: "#18181b",
            plot_bgcolor: "#18181b",
            font: { color: "#e5e5e5" },
            ...data.layout,
          }}
          config={{
            responsive: true,
            displaylogo: false,
            ...data.config,
          }}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}
