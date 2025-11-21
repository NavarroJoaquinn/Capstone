"use client";

interface Props {
  columns: string[];
  selectedColumns: string[];
  onChange: (cols: string[]) => void;
}

export default function ColumnsStep({
  columns,
  selectedColumns,
  onChange,
}: Props) {
  const toggleColumn = (col: string) => {
    if (selectedColumns.includes(col)) {
      onChange(selectedColumns.filter((c) => c !== col));
    } else {
      onChange([...selectedColumns, col]);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">2) Seleccionar Columnas</h2>

      {columns.length === 0 ? (
        <p className="text-gray-400">Este dataset no tiene columnas.</p>
      ) : (
        <ul className="space-y-2">
          {columns.map((col) => (
            <li
              key={col}
              onClick={() => toggleColumn(col)}
              className={`p-3 rounded cursor-pointer border ${
                selectedColumns.includes(col)
                  ? "bg-blue-600 border-blue-400"
                  : "bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
              }`}
            >
              {col}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}