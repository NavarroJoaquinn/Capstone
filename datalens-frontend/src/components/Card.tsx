interface CardProps {
  title: string;
  value: string | number;
}

export default function Card({ title, value }: CardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 border">
      <h3 className="text-gray-600 text-sm">{title}</h3>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}