"use client";

interface Props {
  available: string[];
  selected: string[];
  onChange: (cols: string[]) => void;
}

export default function DualColumnSelector({
  available,
  selected,
  onChange,
}: Props) {
  // Mover de disponibles → seleccionadas
  const addColumn = (col: string) => {
    if (selected.includes(col)) return;
    onChange([...selected, col]);
  };

  // Mover de seleccionadas → disponibles
  const removeColumn = (col: string) => {
    onChange(selected.filter((c) => c !== col));
  };

  return (
    <div className="flex items-center justify-center gap-6">

      {/* DISPONIBLES */}
      <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 w-40">
        <h4 className="text-sm text-zinc-400 mb-2">Disponibles</h4>

        <div className="max-h-64 overflow-auto flex flex-col gap-1">
          {available
            .filter((c) => !selected.includes(c))
            .map((col) => (
              <button
                key={col}
                onClick={() => addColumn(col)}
                className="w-full text-left px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-sm"
              >
                {col}
              </button>
            ))}
        </div>
      </div>

      {/* FLECHAS */}
      <div className="flex flex-col gap-4">
        <button
          className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded"
          onClick={() => {
            // mueve todo
            const remaining = available.filter((c) => !selected.includes(c));
            onChange([...selected, ...remaining]);
          }}
        >
          ➜
        </button>

        <button
          className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded"
          onClick={() => onChange([])}
        >
          ✖
        </button>
      </div>

      {/* SELECCIONADAS */}
      <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 w-40">
        <h4 className="text-sm text-zinc-400 mb-2">Seleccionadas</h4>

        <div className="max-h-64 overflow-auto flex flex-col gap-1">
          {selected.map((col) => (
            <button
              key={col}
              onClick={() => removeColumn(col)}
              className="w-full text-left px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-sm"
            >
              {col}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}