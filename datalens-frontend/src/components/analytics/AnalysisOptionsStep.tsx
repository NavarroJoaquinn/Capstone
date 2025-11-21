"use client";

interface Props {
  onBack: () => void;
  onSelectOption: (option: string) => void;
}

export default function AnalysisOptionsStep({ onBack, onSelectOption }: Props) {
  return (
    <div className="flex flex-col items-center mt-10 text-white w-full">
      <h2 className="text-3xl font-bold mb-10">Seleccionar Análisis</h2>

      <div className="grid grid-cols-2 gap-6 w-[500px]">
        <button
          onClick={() => onSelectOption("basic")}
          className="p-4 rounded bg-blue-600 hover:bg-blue-500"
        >
          🧩 Análisis Básico
        </button>

        <button
          onClick={() => onSelectOption("value_counts")}
          className="p-4 rounded bg-purple-600 hover:bg-purple-500"
        >
          # Frecuencias
        </button>

        <button
          onClick={() => onSelectOption("correlation")}
          className="p-4 rounded bg-teal-600 hover:bg-teal-500"
        >
          📊 Correlación
        </button>

        <button
          onClick={() => onSelectOption("histogram")}
          className="p-4 rounded bg-orange-600 hover:bg-orange-500"
        >
          📈 Histograma
        </button>

        <button
          onClick={() => onSelectOption("heatmap")}
          className="p-4 rounded bg-red-600 hover:bg-red-500"
        >
          🔥 Heatmap
        </button>

        <button
          onClick={() => onSelectOption("scatter")}
          className="p-4 rounded bg-yellow-600 hover:bg-yellow-500 text-black"
        >
          🔵 Scatter Plot
        </button>
      </div>

      <button
        onClick={onBack}
        className="px-6 py-2 rounded bg-zinc-700 hover:bg-zinc-600 mt-12"
      >
        Anterior
      </button>
    </div>
  );
}