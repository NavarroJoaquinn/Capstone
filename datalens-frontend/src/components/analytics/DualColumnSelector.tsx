"use client";

import { useState } from "react";

export interface DualColumnSelectorProps {
  available: string[];
  selected: string[];
  onChange: (newSelected: string[]) => void;
}

export default function DualColumnSelector({
  available,
  selected,
  onChange,
}: DualColumnSelectorProps) {
  const [leftSelected, setLeftSelected] = useState<string[]>([]);
  const [rightSelected, setRightSelected] = useState<string[]>([]);

  // Mover columnas → derecha (seleccionadas)
  const moveRight = () => {
    const updated = [...selected, ...leftSelected.filter((c) => !selected.includes(c))];
    onChange(updated);
    setLeftSelected([]);
  };

  // Mover columnas → izquierda (disponibles)
  const moveLeft = () => {
    const updated = selected.filter((col) => !rightSelected.includes(col));
    onChange(updated);
    setRightSelected([]);
  };

  const availableClean = available.filter((col) => !selected.includes(col));

  return (
    <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-zinc-900 rounded-lg border border-zinc-700">

      {/* COLUMNA IZQUIERDA */}
      <div>
        <h3 className="text-gray-300 font-semibold mb-2">Disponibles</h3>
        <div className="h-64 overflow-auto border border-zinc-700 rounded bg-zinc-800">
          {availableClean.map((col) => (
            <div key={col} className="px-3 py-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={leftSelected.includes(col)}
                onChange={() =>
                  setLeftSelected((prev) =>
                    prev.includes(col)
                      ? prev.filter((x) => x !== col)
                      : [...prev, col]
                  )
                }
              />
              <span className="text-gray-200">{col}</span>
            </div>
          ))}
        </div>
      </div>

      {/* BOTONES */}
      <div className="flex flex-col justify-center items-center gap-4">
        <button
          onClick={moveRight}
          className="px-4 py-2 w-32 bg-green-700 hover:bg-green-600 text-white rounded"
        >
          ➜
        </button>

        <button
          onClick={moveLeft}
          className="px-4 py-2 w-32 bg-red-700 hover:bg-red-600 text-white rounded"
        >
          ←
        </button>
      </div>

      {/* COLUMNA DERECHA */}
      <div>
        <h3 className="text-gray-300 font-semibold mb-2">Seleccionadas</h3>
        <div className="h-64 overflow-auto border border-zinc-700 rounded bg-zinc-800">
          {selected.map((col) => (
            <div key={col} className="px-3 py-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={rightSelected.includes(col)}
                onChange={() =>
                  setRightSelected((prev) =>
                    prev.includes(col)
                      ? prev.filter((x) => x !== col)
                      : [...prev, col]
                  )
                }
              />
              <span className="text-gray-200">{col}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}