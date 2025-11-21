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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Selecciona tipo de visualización</h2>

      <div className="flex gap-4">
        <button
          onClick={() => onVisualize("histogram")}
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
        >
          Histograma
        </button>

        <button
          onClick={() => onVisualize("piechart")}
          className="px-4 py-2 rounded bg-green-600 hover:bg-green-700"
        >
          Pie Chart
        </button>

        <button
          onClick={() => onVisualize("heatmap")}
          className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700"
        >
          Heatmap
        </button>
      </div>
    </div>
  );
}