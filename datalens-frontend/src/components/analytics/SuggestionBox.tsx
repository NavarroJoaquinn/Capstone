"use client";

interface Props {
  semanticTypes: Record<string, string>;
  columns: string[];
}

export default function SuggestionBox({ semanticTypes, columns }: Props) {
  if (columns.length === 0) return null;

  const messages: string[] = [];

  if (columns.length === 1) {
    const col = columns[0];
    const type = semanticTypes[col];

    if (type === "numeric") {
      messages.push("• Perfecto para Histograma.");
      messages.push("• Posible para Heatmap si seleccionas más columnas numéricas.");
    }

    if (type === "categorical") {
      messages.push("• Pie Chart recomendado (gráfico de torta).");
      messages.push("• Frecuencias / Value Counts también funciona.");
    }
  }

  if (columns.length > 1) {
    const numericColumns = columns.filter((c) => semanticTypes[c] === "numeric");
    if (numericColumns.length >= 2) {
      messages.push("• Heatmap recomendado para correlaciones.");
    }
  }

  return (
    <div className="mt-6 p-4 bg-blue-950 border border-blue-700 rounded">
      <h3 className="text-lg font-bold mb-2 text-blue-300">Sugerencias</h3>
      {messages.map((msg, i) => (
        <p key={i} className="text-blue-200">
          {msg}
        </p>
      ))}
    </div>
  );
}