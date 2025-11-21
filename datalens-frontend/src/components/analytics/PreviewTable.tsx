"use client";

interface Props {
  data: any[];          // filas
  columns: string[];    // nombres de columnas
}

export default function PreviewTable({ data, columns }: Props) {
  if (!data || data.length === 0) {
    return (
      <p className="text-gray-400 mt-4">
        No hay datos para mostrar.
      </p>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto max-h-[400px] border border-zinc-700 rounded">
      <table className="min-w-full text-sm text-left text-gray-300">
        <thead className="bg-zinc-800 text-gray-200 sticky top-0">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-2 border-b border-zinc-700">
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.slice(0, 20).map((row, index) => (
            <tr key={index} className="odd:bg-zinc-900 even:bg-zinc-800">
              {columns.map((col) => (
                <td key={col} className="px-4 py-2 border-b border-zinc-700">
                  {String(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}