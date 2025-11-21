"use client";

interface Props {
  datasets: any[];
  selectedDataset: string | null;
  onSelect: (id: string) => void;
}

export default function DatasetStep({
  datasets,
  selectedDataset,
  onSelect,
}: Props) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">1) Seleccionar Dataset</h2>

      {datasets.length === 0 ? (
        <p className="text-gray-400">
          No tienes datasets. Sube uno en la sección "Datasets".
        </p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {datasets.map((d) => (
            <li
              key={d._id}
              onClick={() => onSelect(d._id)}
              className={`p-4 rounded border cursor-pointer ${
                selectedDataset === d._id
                  ? "bg-blue-600 border-blue-400"
                  : "bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
              }`}
            >
              <p className="font-bold">{d.name}</p>
              <p className="text-gray-400 text-sm">{d.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}