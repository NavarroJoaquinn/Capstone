"use client";

import DualColumnSelector from "./DualColumnSelector";

interface Props {
  availableColumns: string[];
  selectedColumns: string[];
  onChange: (cols: string[]) => void;
  onNext: () => void;
  onBack?: () => void;
}

export default function ColumnSelectionStep({
  availableColumns,
  selectedColumns,
  onChange,
  onNext,
  onBack,
}: Props) {
  return (
    <div className="flex flex-col items-center w-full text-white mt-10">
      <h2 className="text-3xl font-bold mb-8">Seleccionar Columnas</h2>

      {/* Selector en el centro */}
      <div className="flex justify-center w-full">
        <DualColumnSelector
          available={availableColumns}
          selected={selectedColumns}
          onChange={onChange}
        />
      </div>

      {/* Botones */}
      <div className="flex gap-4 mt-10">
        {onBack && (
          <button
            onClick={onBack}
            className="px-6 py-2 rounded bg-zinc-700 hover:bg-zinc-600"
          >
            Anterior
          </button>
        )}

        <button
          onClick={onNext}
          disabled={selectedColumns.length === 0}
          className={`px-6 py-2 rounded ${
            selectedColumns.length > 0
              ? "bg-green-600 hover:bg-green-500"
              : "bg-gray-700 cursor-not-allowed"
          }`}
        >
          Confirmar Columnas
        </button>
      </div>
    </div>
  );
}