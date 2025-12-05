"use client";

interface InsightsPanelProps {
  stats: any | null;
  categorySummary: { label: string; count: number }[] | null;
  columnName?: string;
}

function formatNumber(value: any, digits = 2) {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return "-";
  }
  return Number(value).toLocaleString("es-CL", {
    maximumFractionDigits: digits,
  });
}

export default function InsightsPanel({
  stats,
  categorySummary,
  columnName,
}: InsightsPanelProps) {
  if (!stats || !columnName) {
    return null;
  }

  const desc = stats.describe || {};
  const totalRows = desc.count ?? stats.total_count ?? null;
  const nullCount = stats.null_count ?? null;
  const uniqueCount = stats.unique_count ?? null;
  const dtype = stats.dtype ?? "desconocido";

  const isNumeric =
    typeof dtype === "string" &&
    (dtype.includes("float") ||
      dtype.includes("int") ||
      dtype.includes("number"));

  return (
    <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-700 rounded-2xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold">
            Insights de la columna <span className="text-blue-400">{columnName}</span>
          </h2>
          <p className="text-sm text-gray-400">
            Tipo detectado: <span className="font-mono">{dtype}</span>
          </p>
        </div>

        <div className="text-sm text-gray-400">
          {totalRows !== null && (
            <span className="mr-4">
              Filas válidas:{" "}
              <span className="font-semibold text-white">
                {formatNumber(totalRows, 0)}
              </span>
            </span>
          )}
          {nullCount !== null && (
            <span>
              Nulos:{" "}
              <span className="font-semibold text-white">
                {formatNumber(nullCount, 0)}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-950/60 rounded-xl p-4 border border-zinc-800">
          <p className="text-xs uppercase tracking-wide text-gray-400">
            Valores únicos
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {uniqueCount !== null ? formatNumber(uniqueCount, 0) : "-"}
          </p>
        </div>

        {isNumeric && (
          <>
            <div className="bg-zinc-950/60 rounded-xl p-4 border border-zinc-800">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Promedio
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {formatNumber(desc.mean)}
              </p>
            </div>
            <div className="bg-zinc-950/60 rounded-xl p-4 border border-zinc-800">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Mín / Máx
              </p>
              <p className="mt-1 text-lg font-semibold">
                {formatNumber(desc.min)}{" "}
                <span className="text-gray-400 text-sm">→</span>{" "}
                {formatNumber(desc.max)}
              </p>
            </div>
          </>
        )}

        {!isNumeric && (
          <div className="bg-zinc-950/60 rounded-xl p-4 border border-zinc-800">
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Valor más frecuente
            </p>
            <p className="mt-1 text-sm font-semibold text-white break-all">
              {stats.top_value !== undefined && stats.top_value !== null
                ? String(stats.top_value)
                : "-"}
            </p>
          </div>
        )}
      </div>

      {/* Top categorías (solo si hay resumen categórico) */}
      {categorySummary && categorySummary.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2 text-gray-200">
            Top categorías por frecuencia
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-zinc-950">
                  <th className="text-left px-3 py-2 border-b border-zinc-800">
                    Categoría
                  </th>
                  <th className="text-right px-3 py-2 border-b border-zinc-800">
                    Conteo
                  </th>
                </tr>
              </thead>
              <tbody>
                {categorySummary.map((item) => (
                  <tr key={item.label} className="odd:bg-zinc-950 even:bg-zinc-900">
                    <td className="px-3 py-2 border-b border-zinc-900">
                      {item.label === "" ? "(vacío)" : item.label}
                    </td>
                    <td className="px-3 py-2 border-b border-zinc-900 text-right">
                      {formatNumber(item.count, 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}