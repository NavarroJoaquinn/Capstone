"use client";

interface Props {
  datasets: any[];
  onSelect: (id: string) => void;
}

export default function DatasetSelector({ datasets, onSelect }: Props) {
  return (
    <div className="mb-4">
      <label className="text-sm text-zinc-400 block mb-1">Seleccionar Dataset</label>

      <select
        className="w-full bg-zinc-800 text-white p-2 rounded border border-zinc-700"
        onChange={(e) => onSelect(e.target.value)}
        defaultValue=""
      >
        <option value="">-- Seleccionar --</option>

        {datasets.map((d) => (
          <option key={d._id} value={d._id}>
            {d.name ?? "Sin nombre"}
          </option>
        ))}
      </select>
    </div>
  );
}