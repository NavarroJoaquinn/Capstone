"use client";

interface AnalysisResultProps {
  title: string;
  data: any;
}

export default function AnalysisResult({ title, data }: AnalysisResultProps) {
  if (!data) return null;

  return (
    <div className="mt-6 bg-gray-900 border border-gray-700 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>

      <pre className="text-gray-300 text-sm bg-gray-800 p-3 rounded overflow-x-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}