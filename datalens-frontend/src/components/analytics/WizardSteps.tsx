"use client";

interface Props {
  step: number;
}

export default function WizardSteps({ step }: Props) {
  const steps = [
    "Dataset",
    "Columnas",
    "Confirmación",
    "Visualización",
  ];

  return (
    <div className="flex gap-6 mb-10">
      {steps.map((label, index) => {
        const num = index + 1;
        const active = num === step;
        const done = num < step;

        return (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center 
              ${active ? "bg-blue-500" : done ? "bg-green-600" : "bg-zinc-700"}`}
            >
              {num}
            </div>
            <span className={active ? "text-white font-bold" : "text-gray-400"}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}