"use client";

interface Props {
  selectedColumns: string[];
  semanticTypes: Record<string, string>;  // ← AGRÉGALO AQUÍ
  onConfirm: () => void;
}

export default function ConfirmColumnsStep({
  selectedColumns,
  semanticTypes,
  onConfirm,
}: Props) {
  return (
    <div className="max-w-3xl mx-auto mt-8 text-center space-y-6">
      <h2 className="text-2xl font-semibold">Confirmar Columnas</h2>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-left">
        {selectedColumns.length === 0 ? (
          <p className="text-gray-400">
            No hay columnas seleccionadas. Vuelve al paso anterior y elige al menos una.
          </p>
        ) : (
          <ul className="space-y-2">
            {selectedColumns.map((col) => (
              <li
                key={col}
                className="px-3 py-2 rounded-lg bg-zinc-800 flex items-center justify-between"
              >
                <span className="font-medium">{col}</span>
                <span className="text-xs text-gray-400">
                  Tipo detectado: {semanticTypes[col] ?? "desconocido"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={onConfirm}
        className="inline-flex px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold"
        disabled={selectedColumns.length === 0}
      >
        Confirmar columnas
      </button>
    </div>
  );
}