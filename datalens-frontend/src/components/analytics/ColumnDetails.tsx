"use client";

interface Props {
  stats: any | null;
  column: string | null;
}

export default function ColumnDetails({ stats, column }: Props) {
  if (!column) {
    return <p className="text-gray-400 mt-4">Selecciona una columna.</p>;
  }

  if (!stats) {
    return <p className="text-gray-400 mt-4">Cargando detalles...</p>;
  }

  return (
    <div className="mt-6 p-4 bg-zinc-900 border border-zinc-700 rounded">
      <h3 className="text-xl font-bold mb-4 text-blue-400">
        Detalles de columna: {column}
      </h3>

      <p><b>Tipo detectado:</b> {stats.dtype}</p>
      <p><b>Nulos:</b> {stats.null_count}</p>
      <p><b>Únicos:</b> {stats.unique_count}</p>
      <p><b>Valor frecuente:</b> {String(stats.top_value)}</p>

      <h4 className="text-lg mt-4 mb-2 text-gray-300">Describe:</h4>
      <pre className="text-sm bg-black p-3 rounded border border-zinc-800">
        {JSON.stringify(stats.describe, null, 2)}
      </pre>
    </div>
  );
}