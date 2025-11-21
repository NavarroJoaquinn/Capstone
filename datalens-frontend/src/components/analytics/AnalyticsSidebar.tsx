"use client";

import { useState } from "react";
import DatasetSelector from "./DatasetSelector";
import { FiMenu, FiBarChart2, FiHash, FiGrid } from "react-icons/fi";

interface Props {
  datasets: any[];
  columns: string[];
  selectedColumns: string[];
  onDatasetSelect: (id: string) => void;
  onColumnChange: (cols: string[]) => void;   // ⬅️ ESTA FALTABA
  onRun: (type: string) => void;
}

export default function AnalyticsSidebar({
  datasets,
  columns,
  selectedColumns,
  onDatasetSelect,
  onRun,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`bg-zinc-900 border-r border-zinc-800 fixed left-0 top-16 bottom-0 
        p-4 transition-all duration-300 overflow-y-auto
        ${collapsed ? "w-20" : "w-72"}`}
    >
      {/* Botón de colapsar */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="text-white mb-6 p-2 hover:bg-zinc-800 rounded"
      >
        <FiMenu size={20} />
      </button>

      {!collapsed && (
        <>
          <h2 className="text-xl font-bold text-white mb-4">Analíticas</h2>

          {/* Selector de dataset */}
          <DatasetSelector datasets={datasets} onSelect={onDatasetSelect} />

          {/* Acciones */}
          {columns.length > 0 && (
            <div className="mt-6 flex flex-col gap-3 pb-10">
              <button
                onClick={() => onRun("basic")}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white p-2 rounded flex items-center gap-2"
              >
                <FiGrid />
                Análisis Básico
              </button>

              <button
                onClick={() => onRun("value_counts")}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white p-2 rounded flex items-center gap-2"
              >
                <FiHash />
                Frecuencias
              </button>

              <button
                onClick={() => onRun("correlation")}
                className="w-full bg-teal-600 hover:bg-teal-500 text-white p-2 rounded flex items-center gap-2"
              >
                <FiBarChart2 />
                Correlación
              </button>
            </div>
          )}
        </>
      )}

      {/* Sidebar colapsado */}
      {collapsed && (
        <div className="flex flex-col items-center gap-4 mt-4">
          <button
            onClick={() => onRun("basic")}
            className="bg-blue-600 p-3 rounded hover:bg-blue-500"
          >
            <FiGrid className="text-white" />
          </button>

          <button
            onClick={() => onRun("value_counts")}
            className="bg-purple-600 p-3 rounded hover:bg-purple-500"
          >
            <FiHash className="text-white" />
          </button>

          <button
            onClick={() => onRun("correlation")}
            className="bg-teal-600 p-3 rounded hover:bg-teal-500"
          >
            <FiBarChart2 className="text-white" />
          </button>
        </div>
      )}
    </aside>
  );
}