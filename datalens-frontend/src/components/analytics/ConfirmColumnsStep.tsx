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
    <div>
      <h2 className="text-2xl font-bold mb-4">Confirmar Columnas</h2>

      <ul className="space-y-2 mb-6">
        {selectedColumns.map((col) => (
          <li
            key={col}
            className="p-3 bg-zinc-800 rounded border border-zinc-700"
          >
            <p className="font-semibold">{col}</p>
            <p className="text-gray-400 text-sm">
              Tipo detectado: {semanticTypes[col] ?? "desconocido"}
            </p>
          </li>
        ))}
      </ul>

      <button
        onClick={onConfirm}
        className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
      >
        Confirmar columnas
      </button>
    </div>
  );
}