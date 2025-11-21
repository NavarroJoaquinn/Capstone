"use client";

interface Props {
  selectedColumns: string[];
  analysis: string;
  onBack: () => void;
  onNext: (config: any) => void;
}

export default function AnalysisConfigStep({
  selectedColumns,
  analysis,
  onBack,
  onNext,
}: Props) {
  const handleContinue = () => {
    onNext({ column: selectedColumns[0] }); // Placeholder
  };

  return (
    <div className="flex flex-col items-center mt-10 text-white w-full">
      <h2 className="text-3xl font-bold mb-6">Configurar Análisis</h2>

      <p className="text-lg mb-10">
        Configuración para:{" "}
        <span className="text-blue-400 font-semibold">{analysis}</span>
      </p>

      {/* Aquí luego agregamos selects dinámicos según el análisis */}
      <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700">
        <p className="text-gray-300">
          (Próximamente: configuración real según el análisis 🚀)
        </p>
      </div>

      <div className="flex gap-4 mt-10">
        <button
          onClick={onBack}
          className="px-6 py-2 rounded bg-zinc-700 hover:bg-zinc-600"
        >
          Anterior
        </button>

        <button
          onClick={handleContinue}
          className="px-6 py-2 rounded bg-green-600 hover:bg-green-500"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}