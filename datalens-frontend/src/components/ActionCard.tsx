"use client";

export interface ActionCardProps {
  title: string;
  color?: string; // <-- ahora color ES OPCIONAL
  onClick: () => void;
}

export default function ActionCard({
  title,
  color = "blue",
  onClick,
}: ActionCardProps) {
  const baseColor =
    color === "red"
      ? "bg-red-700 hover:bg-red-600"
      : color === "green"
      ? "bg-green-700 hover:bg-green-600"
      : color === "orange"
      ? "bg-orange-700 hover:bg-orange-600"
      : color === "purple"
      ? "bg-purple-700 hover:bg-purple-600"
      : "bg-blue-700 hover:bg-blue-600"; // default

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded text-white font-semibold transition ${baseColor}`}
    >
      {title}
    </button>
  );
}