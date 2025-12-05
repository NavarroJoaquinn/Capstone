"use client";

interface Props {
  selectedColumns: string[];
  onVisualize: (type: "histogram" | "piechart" | "heatmap") => void;
}

export default function VisualizationStep({ selectedColumns, onVisualize }: Props) {
  if (selectedColumns.length === 0) {
    return <p className="text-gray-400">No hay columnas seleccionadas.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 text-center space-y-6">
      <h2 className="text-2xl font-semibold">
        Selecciona tipo de visualización
      </h2>

      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() => onVisualize("histogram")}
          className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold"
        >
          Histograma
        </button>

        <button
          onClick={() => onVisualize("piechart")}
          className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-500 font-semibold"
        >
          Pie Chart
        </button>

        <button
          onClick={() => onVisualize("heatmap")}
          className="px-6 py-3 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 font-semibold"
        >
          Heatmap
        </button>
      </div>
    </div>
  );
}